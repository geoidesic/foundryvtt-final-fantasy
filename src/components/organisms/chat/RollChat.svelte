<script>
  import { onMount, getContext } from "svelte";
  import { SYSTEM_ID } from "~/src/helpers/constants";

  export let FFMessage;
  export let messageId;
  export let content;

  const message = getContext("message");

  let actionResult = "";
  let showTraitButton = false;

  onMount(async () => {
    game.system.log.d("RollChat mounted", FFMessage);

    if (FFMessage?.item?.type === "action") {
      const roll = FFMessage.roll;
      const item = FFMessage.item;
      const hasTargets = FFMessage.hasTargets;
      const modifier = FFMessage.extraModifiers?.modifier || 0;
      const totalRoll = roll + modifier;

      // If we have targets, check their defense/magic defense
      if (hasTargets) {
        const targets = Array.from(game.user.targets);
        let allTargetsHit = true;
        let damageFormula = item.system?.formula || "0";
        let directHitFormula = item.system?.directHitDamage || "0";

        for (const target of targets) {
          if (!target.actor?.system?.attributes?.secondary) continue;

          const defense = target.actor.system.attributes.secondary.defence?.val || 0;
          const magicDefense = target.actor.system.attributes.secondary.magicDefence?.val || 0;
          const defenseToUse = Math.max(defense, magicDefense);

          if (totalRoll >= defenseToUse) {
            actionResult += `Hit ${target.name} (Defense: ${defenseToUse})<br>`;
            actionResult += `Damage Formula: ${damageFormula}<br>`;
            if (item.system?.hasDirectHit) {
              actionResult += `Direct Hit Formula: ${directHitFormula}<br>`;
            }
          } else {
            allTargetsHit = false;
            actionResult += `Miss ${target.name} (Defense: ${defenseToUse})<br>`;
            actionResult += `Damage Formula: ${damageFormula}<br>`;
          }
        }

        // Show trait button if all targets were hit
        showTraitButton = allTargetsHit && item.system?.enables?.list?.length > 0;
      } else {
        actionResult = "No targets selected. Select targets and roll again.";
      }
    }
  });

  async function applyTrait() {
    if (!FFMessage?.item?.system?.enables?.list?.length) return;

    const trait = await fromUuid(FFMessage.item.system.enables.list[0].uuid);
    if (!trait) return;

    // Apply trait to all targets
    const targets = Array.from(game.user.targets);
    for (const target of targets) {
      if (target.actor) {
        await target.actor.createEmbeddedDocuments("Item", [trait]);
      }
    }

    showTraitButton = false;
    actionResult += `<br>Applied ${trait.name} to targets`;
  }
</script>

<template lang="pug">
.FF15
  .flexrow
    .flex0.img.mr-xs
      img.actor-img(src="{FFMessage?.actor?.img}" alt="{FFMessage?.actor?.name}")
    .flex3.content
      div {@html content}
  .flexrow
    .flex4
      +if("FFMessage?.item?.type === 'action'")
        .action-result
          div {@html actionResult}
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
  padding: 0.5em
  background: rgba(0, 0, 0, 0.05)
  border-radius: 3px

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