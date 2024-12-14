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
  let damageResults = new Map(); // Store damage results by target ID
  let appliedDamageByTarget = new Map(); // Track which targets have damage applied

  onMount(async () => {
    game.system.log.d("RollChat mounted", FFMessage);

    if (FFMessage?.item?.type === "action") {
      const roll = FFMessage.roll;
      const item = FFMessage.item;
      const hasTargets = FFMessage.hasTargets;
      const modifier = FFMessage.extraModifiers?.modifier || 0;
      totalRoll = roll + modifier;

      // If we have targets, either load from flags or current targets
      if (hasTargets) {
        const storedTargetUuids = $message?.flags?.[SYSTEM_ID]?.targetUuids || [];
        const storedDamageResults = $message?.flags?.[SYSTEM_ID]?.damageResults || {};

        if (storedTargetUuids.length > 0) {
          // Load targets from stored UUIDs
          targets = await Promise.all(
            storedTargetUuids.map(async (uuid) => {
              const token = await fromUuid(uuid);
              return token || { isUnlinked: true, name: "Unlinked Token" };
            }),
          );
          // Load stored damage results
          damageResults = new Map(Object.entries(storedDamageResults));
          // Initialize appliedDamageByTarget from stored results
          appliedDamageByTarget = new Map();
          Object.keys(storedDamageResults).forEach(id => appliedDamageByTarget.set(id, true));
        } else {
          // Store current targets
          targets = Array.from(game.user.targets);
          const targetUuids = targets.map((t) => t.document.uuid);

          // Update the message with target UUIDs
          await $message?.update({
            flags: {
              [SYSTEM_ID]: {
                targetUuids,
              },
            },
          });
        }

        let allTargetsHit = true;
        showTraitButton = allTargetsHit && item.system?.enables?.list?.length > 0 && targets.every((t) => !t.isUnlinked);
      }
    }
  });

  async function applyResult(target) {
    if (!target.actor || target.isUnlinked) return;

    const item = FFMessage.item;
    const modifier = FFMessage.extraModifiers?.modifier || 0;
    let totalDamage = 0;
    const results = { damage: 0, directHit: 0 };

    // Calculate base damage
    if (item.system?.formula) {
      const formula = item.system.formula.includes('d') 
        ? `${item.system.formula} + ${modifier}`  // Add modifier to dice rolls
        : `${parseInt(item.system.formula) + modifier}`; // Add modifier to static values
      
      if (formula.includes('d')) {
        const damageRoll = await new Roll(formula).evaluate({async: true});
        results.damage = damageRoll.total;
      } else {
        results.damage = parseInt(formula) || 0;
      }
      totalDamage += results.damage;
    }

    // Calculate direct hit damage if applicable - only if it's a hit
    if (isHit(target) && item.system?.hasDirectHit && item.system?.directHitDamage) {
      const directHitFormula = item.system.directHitDamage.includes('d')
        ? `${item.system.directHitDamage} + ${modifier}`  // Add modifier to dice rolls
        : `${parseInt(item.system.directHitDamage) + modifier}`; // Add modifier to static values

      if (directHitFormula.includes('d')) {
        const directHitRoll = await new Roll(directHitFormula).evaluate({async: true});
        results.directHit = directHitRoll.total;
      } else {
        results.directHit = parseInt(directHitFormula) || 0;
      }
      totalDamage += results.directHit;
    }

    // Apply damage to target
    const currentHP = target.actor.system.points.HP.val;
    const newHP = Math.max(0, currentHP - totalDamage);
    await target.actor.update({
      "system.points.HP.val": newHP
    });

    // Toggle KO condition if HP drops to 0
    if (currentHP > 0 && newHP <= 0) {
      await target.actor.toggleStatusEffect("ko");
    }

    // Store results
    damageResults.set(target.id, {
      damage: results.damage,
      directHit: results.directHit,
      originalHP: currentHP,
      wasKOd: currentHP > 0 && newHP <= 0,  // Store if we applied KO
      modifier
    });
    appliedDamageByTarget.set(target.id, true);
    appliedDamageByTarget = appliedDamageByTarget;

    // Update message flags
    await $message.update({
      flags: {
        [SYSTEM_ID]: {
          damageResults: Object.fromEntries(damageResults)
        }
      }
    });
  }

  async function undoResult(target) {
    if (!target.actor || target.isUnlinked) return;

    const result = damageResults.get(target.id);
    if (!result) return;

    // Restore original HP
    await target.actor.update({
      "system.points.HP.val": result.originalHP
    });

    // Remove KO if we applied it
    if (result.wasKOd) {
      await target.actor.toggleStatusEffect("ko");
    }

    // Remove result from storage and force UI update
    damageResults.delete(target.id);
    appliedDamageByTarget.delete(target.id);
    appliedDamageByTarget = appliedDamageByTarget;

    // Update message flags
    await $message.update({
      flags: {
        [SYSTEM_ID]: {
          damageResults: Object.fromEntries(damageResults)
        }
      }
    });
  }

  function getDamageDisplay(target, type) {
    const result = damageResults.get(target.id);
    if (!result) {
      return type === 'damage' 
        ? FFMessage.item.system?.formula 
        : FFMessage.item.system?.directHitDamage;
    }
    return result[type];
  }

  function hasAppliedDamage(target) {
    return damageResults.has(target.id);
  }

  function log() {
    game.system.log.d("RollChat FFMessage", FFMessage);
    game.system.log.d("RollChat message", $message);
  }

  async function applyTrait() {
    if (!FFMessage?.item?.system?.enables?.list?.length) return;

    const trait = await fromUuid(FFMessage.item.system.enables.list[0].uuid);
    if (!trait) return;

    // Apply trait to all existing targets
    for (const target of targets) {
      if (target.actor && !target.isUnlinked) {
        await target.actor.createEmbeddedDocuments("Item", [trait]);
      }
    }

    showTraitButton = false;
  }

  function getDefenseValue(target) {
    // game.system.log.d("Getting defense for target", target);
    // game.system.log.d("Target actor", target.actor);
    // game.system.log.d("Target actor system", target.actor?.system);
    // game.system.log.d("Target actor attributes", target.actor?.system?.attributes);
    
    if (target.isUnlinked || !target.actor?.system?.attributes) return 0;
    
    // For NPCs, defense is directly in attributes
    if (target.actor.type === 'npc') {
      const defense = target.actor.system.attributes.defence?.val || 0;
      game.system.log.d("NPC defense value", defense);
      return defense;
    }
    
    // For PCs, defense is in secondary attributes
    const defense = target.actor.system.attributes.secondary?.def?.val || 0;
    const magicDefense = target.actor.system.attributes.secondary?.mag?.val || 0;
    // game.system.log.d("PC defense values", { defense, magicDefense });
    return Math.max(defense, magicDefense);
  }

  function isHit(target) {
    return totalRoll >= getDefenseValue(target);
  }

  function getTargetImage(target) {
    if (target.isUnlinked) return null;
    return target.document?.texture?.src || target.actor?.img;
  }

  function openActorSheet(actor) {
    if (!actor) return;
    actor.sheet.render(true);
  }

  $: actor = game.actors.get(FFMessage?.actor?._id);
  $: {
    // Update appliedDamageByTarget when damageResults changes
    appliedDamageByTarget = new Map();
    damageResults.forEach((_, id) => appliedDamageByTarget.set(id, true));
  }
</script>

<template lang="pug">
.FF15
  .flexrow
    .flex0.img.mr-xs.pointer
      img.actor-img.clickable(src="{FFMessage?.actor?.img}" alt="{FFMessage?.actor?.name}" on:click!="{openActorSheet(actor)}")
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
                  .target-row.flexrow.gap-4(class="{target.isUnlinked ? 'unlinked' : ''}")
                    .flex3
                      .flexrow.justify-vertical.gap-4
                        .flex0.target-info.pointer
                          +if("!target.isUnlinked")
                            img.target-img.clickable(src="{getTargetImage(target)}" alt="{target.name}" on:click!="{openActorSheet(target.actor)}")
                        .flex1
                          .target-name.font-cinzel.smaller {target.name}
                    .flex1.thin-border
                      .flexcol
                        .col.target-defense.flexrow.justify-vertical
                          .flex1.left.font-cinzel.smallest DEF 
                          .flex1.m1-xs.center {getDefenseValue(target)}
                        .col.flexrow.justify-vertical
                          .flex2.font-cinzel.smallest {isHit(target) ? "Hit" : "Miss"}
                          .flex1
                            i.fa-solid(class="{isHit(target) ? 'fa-circle-check positive' : 'fa-circle-xmark negative'}")
                    .flex2.thin-border.bg-gold.wheat
                      +if("FFMessage.item.system?.formula")
                        .flex1.formula.flexrow.justify-vertical
                          .flex3.left.font-cinzel.smallest Damage 
                          .flex1.right {getDamageDisplay(target, 'damage')}
                      +if("FFMessage.item.system?.hasDirectHit")
                        .flex1.formula.flexrow.justify-vertical.smaller
                          .flex3.left.font-cinzel.smallest Direct Hit 
                          .flex1.right {isHit(target) ? getDamageDisplay(target, 'directHit') : 'N/A'}
                    .flex0
                      .flexcol
                        .flex1
                          button.stealth.apply-trait(on:click!="{applyResult(target)}" disabled="{target.isUnlinked || appliedDamageByTarget.has(target.id)}")
                            i.fa-solid.fa-check
                        .flex1
                          button.stealth.apply-trait(on:click!="{undoResult(target)}" disabled="{target.isUnlinked || !appliedDamageByTarget.has(target.id)}")
                            i.fa-solid.fa-refresh
</template>

<style lang="sass">
@import '../../../styles/Mixins.sass'
.img, img
  max-width: 100px
  max-height: 100px

.action-result
  margin-top: 0.2em
  background: rgba(0, 0, 0, 0.05)
  border-radius: 3px

.no-targets
  color: #666
  font-style: italic

.target-list
  display: flex
  flex-direction: column
  gap: 0.2em

.target-row
  display: flex
  justify-content: space-between
  align-items: center
  padding: 0.1em 0.3em
  background: rgba(0, 0, 0, 0.03)
  border-radius: 3px
  border: 1px solid rgba(0, 0, 0, 0.1)
  &.unlinked
    opacity: 0.7
    background: rgba(0, 0, 0, 0.05)
    .target-name
      font-style: italic

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

button:disabled
  opacity: 0.3
  cursor: not-allowed
</style>
