<script>
  import { onMount, getContext } from "svelte";
  import { SYSTEM_ID } from "~/src/helpers/constants";

  export let FFMessage;
  export let messageId;
  export let content;

  const message = getContext("message");
  let showTraitButton = false;
  let targets = [];
  let totalRoll = 0;

  onMount(async () => {
    game.system.log.d("RollChat mounted", FFMessage);

    if (FFMessage?.item?.type === "action") {
      const roll = FFMessage.roll;
      const item = FFMessage.item;
      const hasTargets = FFMessage.hasTargets;
      const modifier = FFMessage.extraModifiers?.modifier || 0;
      totalRoll = roll + modifier;

      // If we have targets, check their defense/magic defense
      if (hasTargets) {
        targets = Array.from(game.user.targets);
        let allTargetsHit = true;

        // Show trait button if all targets were hit
        showTraitButton = allTargetsHit && item.system?.enables?.list?.length > 0;
      }
    }
  });

  async function applyTrait() {
    if (!FFMessage?.item?.system?.enables?.list?.length) return;

    const trait = await fromUuid(FFMessage.item.system.enables.list[0].uuid);
    if (!trait) return;

    // Apply trait to all targets
    for (const target of targets) {
      if (target.actor) {
        await target.actor.createEmbeddedDocuments("Item", [trait]);
      }
    }

    showTraitButton = false;
  }

  function getDefenseValue(target) {
    if (!target.actor?.system?.attributes?.secondary) return 0;
    const defense = target.actor.system.attributes.secondary.defence?.val || 0;
    const magicDefense = target.actor.system.attributes.secondary.magicDefence?.val || 0;
    return Math.max(defense, magicDefense);
  }

  function isHit(target) {
    return totalRoll >= getDefenseValue(target);
  }
</script>

<template lang="pug">
.FF15
  .flexrow
    .flex0.img.mr-xs
      img.actor-img(src="{FFMessage?.actor?.img}" alt="{FFMessage?.actor?.name}")
    .flex3.content
      div {@html content}
  +if("FFMessage?.item?.type === 'action'")
    .flexrow
      .flex4
        .action-result
          +if("targets.length === 0")
            .no-targets No targets selected. Select targets and roll again.
            +else
              .target-list
                +each("targets as target")
                  .target-row.flexrow.gap-4
                    .flex0.target-info
                      img.target-img(src="{target.document?.texture?.src || target.actor?.img}" alt="{target.name}")
                    .flex1
                      .target-name {target.name}
                    .flex1
                      .flexcol
                        .col.target-defense DEF {getDefenseValue(target)}
                    
                        .col.flexrow
                          .flex2 {isHit(target) ? "Hit" : "Miss"}
                          .flex1
                            i.fa-solid(class="{isHit(target) ? 'fa-circle-check positive' : 'fa-circle-xmark negative'}")
                         
                    .flex2
                      +if("FFMessage.item.system?.formula")
                        .flex1.formula Damage: {FFMessage.item.system.formula}
                      +if("FFMessage.item.system?.hasDirectHit")
                        .flex1.formula Direct Hit: {FFMessage.item.system.directHitDamage}
          +if("showTraitButton")
            button.apply-trait(on:click="{applyTrait}") Apply Trait

</template>

<style lang="sass">
@import '../../../styles/Mixins.sass'
.img, img
  max-width: 100px
  max-height: 100px

.action-result
  margin-top: 0.5em
  background: rgba(0, 0, 0, 0.05)
  border-radius: 3px

.no-targets
  color: #666
  font-style: italic

.target-list
  display: flex
  flex-direction: column
  gap: 0.5em

.target-row
  display: flex
  justify-content: space-between
  align-items: center
  padding: 0.3em
  background: rgba(0, 0, 0, 0.03)
  border-radius: 3px
  border: 1px solid rgba(0, 0, 0, 0.1)

.target-info
  display: flex
  align-items: center
  gap: 0.5em
  
  .target-img
    width: 36px
    height: 36px
    border: none
  
  .target-name
    font-weight: bold
  
  .target-defense
    color: #666
    font-size: 0.9em

.target-outcome
  display: flex
  align-items: center
  gap: 0.5em
  
  .hit
    color: #19762d
    font-weight: bold
  
  .miss
    color: #9c0f0f
    font-weight: bold
  
  .formula
    color: #666
    font-size: 0.9em
    &:before
      content: "•"
      margin: 0 0.3em

.apply-trait
  margin-top: 0.5em
  padding: 0.3em 0.6em
  background: #4a4a4a
  color: white
  border: none
  border-radius: 3px
  cursor: pointer
  &:hover
    background: #5a5a5a
</style> 