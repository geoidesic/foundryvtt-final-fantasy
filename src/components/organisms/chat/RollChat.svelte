<script>
  import { onMount, getContext, tick } from "svelte";
  import { writable, derived } from "svelte/store";
  import { SYSTEM_ID } from "~/src/helpers/constants";

  export let FFMessage;
  export let messageId;
  export let content;


  const message = getContext("message");
  let showTraitButton = false;
  let targets = [];
  let totalRoll = 0;
  let isMounted = false;

  // Create stores
  const damageResults = writable(new Map());
  const appliedDamageByTarget = writable(new Map());
  const displayValues = writable(new Map());

  // Derived store for button states
  const hasAppliedDamage = derived(appliedDamageByTarget, ($appliedDamageByTarget) => {
    return new Map(targets.map((target) => [target.id, $appliedDamageByTarget.has(target.id)]));
  });

  $: actor = game.actors.get(FFMessage?.actor?._id);

  $: isApplyDisabled = (target) => target.isUnlinked || $hasAppliedDamage.get(target.id);
  $: displayVal = (target, type) =>  $displayValues.get(target.id)?.[type] || "";

  async function initializeStores() {
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
        const storedAppliedDamage = $message?.flags?.[SYSTEM_ID]?.appliedDamageByTarget || {};
        const storedDisplayValues = $message?.flags?.[SYSTEM_ID]?.displayValues || {};

        if (storedTargetUuids.length > 0) {
          // Load targets from stored UUIDs
          targets = await Promise.all(
            storedTargetUuids.map(async (uuid) => {
              const token = await fromUuid(uuid);
              return token || { isUnlinked: true, name: "Unlinked Token" };
            }),
          );
          // Load stored values
          damageResults.set(new Map(Object.entries(storedDamageResults)));
          appliedDamageByTarget.set(new Map(Object.entries(storedAppliedDamage)));
          displayValues.set(new Map(Object.entries(storedDisplayValues)));
        } else {
          // Initialize display values for each target
          const initialDisplayValues = new Map();
          targets = Array.from(game.user.targets);
          targets.forEach((target) => {
            initialDisplayValues.set(target.id, {
              damage: FFMessage.item.system?.formula,
              directHit: FFMessage.item.system?.directHitDamage,
            });
          });
          displayValues.set(initialDisplayValues);

          // Store current targets
          const targetUuids = targets.map((t) => t.document.uuid);
          await $message?.update({
            flags: {
              [SYSTEM_ID]: {
                targetUuids,
                displayValues: Object.fromEntries($displayValues),
              },
            },
          });
        }
      }
    }
  }

  onMount(async () => {
    game.system.log.d("RollChat isMounted", isMounted);
    if (!isMounted) {
      game.system.log.d("RollChat mounted", FFMessage);
      await initializeStores();
      isMounted = true;
    }
  });

  /**************
   * Apply Result
   **************/
  async function applyResult(target) {
    if (!target.actor || target.isUnlinked) return;

    game.system.log.d("applyResult start", { targetId: target.id });

    const item = FFMessage.item;
    const modifier = FFMessage.extraModifiers?.modifier || 0;
    let totalDamage = 0;
    const results = { damage: 0, directHit: 0 };

    // Calculate base damage
    if (item.system?.formula) {
      results.damage = parseInt(item.system.formula) || 0;
      totalDamage = results.damage;
    }
    // game.system.log.d("rollchat base damage", { results, totalDamage });

    // Calculate direct hit damage if applicable - only if it's a hit
    if (isHit(target) && item.system?.hasDirectHit && item.system?.directHitDamage) {
      const directHitRoll = await new Roll(item.system.directHitDamage).evaluate({ async: true });
      results.directHit = directHitRoll.total;
      totalDamage += results.directHit;

      // game.system.log.d("rollchat total damage", { results, totalDamage });
      // Update display values to show formula and result
      displayValues.update((map) => {
        map.set(target.id, {
          damage: results.damage.toString(),
          directHit: `${item.system.directHitDamage} (${results.directHit})`,
        });
        return map;
      });
    } else {
      // Update display values for damage only
      displayValues.update((map) => {
        map.set(target.id, {
          damage: results.damage.toString(),
          directHit: item.system?.directHitDamage || "",
        });
        return map;
      });
    }

    // game.system.log.d("damage calculated", {
    //   results,
    //   totalDamage,
    //   modifier,
    //   breakdown: `${results.damage} + ${results.directHit} + ${modifier} = ${totalDamage}`,
    // });

    // Apply damage to target
    const currentHP = target.actor.system.points.HP.val;
    const newHP = Math.max(0, currentHP - totalDamage);

    // game.system.log.d("HP update", {
    //   currentHP,
    //   totalDamage,
    //   newHP,
    // });

    await target.actor.update({
      "system.points.HP.val": newHP,
    });

    // Toggle KO condition if HP drops to 0
    if (currentHP > 0 && newHP <= 0) {
      await target.actor.toggleStatusEffect("ko");
    }

    // Update stores
    const newDamageResults = new Map($damageResults);
    newDamageResults.set(target.id, {
      damage: results.damage,
      directHit: results.directHit,
      originalHP: currentHP,
      wasKOd: currentHP > 0 && newHP <= 0,
    });
    damageResults.set(newDamageResults);

    const newAppliedDamage = new Map($appliedDamageByTarget);
    newAppliedDamage.set(target.id, true);
    appliedDamageByTarget.set(newAppliedDamage);

    await tick();
    await tick();
    await tick();
    await tick();
    await tick();
    await tick();
    // Update message flags
      await $message.update({
        flags: {
          [SYSTEM_ID]: {
            damageResults: Object.fromEntries(newDamageResults),
            displayValues: Object.fromEntries($displayValues),
            appliedDamageByTarget: Object.fromEntries(newAppliedDamage),
          },
        },
      });
  }

  /**************
   * Undo Result
   **************/
  async function undoResult(target) {
    if (!target.actor || target.isUnlinked) return;

    const result = $damageResults.get(target.id);
    if (!result) return;

    // game.system.log.d("rollchat undoResult result", result);
    // Restore original HP
    await target.actor.update({
      "system.points.HP.val": result.originalHP,
    });

    // Remove KO if we applied it
    if (result.wasKOd) {
      await target.actor.toggleStatusEffect("ko");
    }

    appliedDamageByTarget.update((map) => {
      const newMap = new Map(map);
      newMap.delete(target.id);
      game.system.log.d("rollchat undoResult appliedDamageByTarget map", map);
      game.system.log.d("rollchat undoResult appliedDamageByTarget newMap", newMap);
      return newMap; // Replacing the Map ensures the derived store updates properly
    });
    damageResults.update((map) => {
      const newMap = new Map(map);
      newMap.delete(target.id);
      return newMap; // Replacing the Map ensures the derived store updates properly
    });
    displayValues.update((map) => {
      const newMap = new Map(map);
      newMap.set(target.id, {
        damage: FFMessage.item.system?.formula,
        directHit: FFMessage.item.system?.directHitDamage,
      });
      return newMap; // Replacing the Map ensures the derived store updates properly
    });
    await tick();
    await tick();
    await tick();
    await tick();
    await tick();
    await tick();
    // game.system.log.d("rollchat undoResult $appliedDamageByTarget", $appliedDamageByTarget);
    // game.system.log.d("rollchat undoResult $isApplyDisabled", isApplyDisabled(target));
    // game.system.log.d("rollchat undoResult isUnlinked", target.isUnlinked)
    // game.system.log.d("rollchat undoResult $hasAppliedDamage.get(target.id)", $hasAppliedDamage.get(target.id))


    setTimeout(async () => {
      console.log("rollchat setTimeout $appliedDamageByTarget", $appliedDamageByTarget);
      await $message.update({
        flags: {
          [SYSTEM_ID]: {
            damageResults: Object.fromEntries($damageResults),
            appliedDamageByTarget: Object.fromEntries($appliedDamageByTarget),
            displayValues: Object.fromEntries($displayValues),
          },
        },
      });
    }, 3000);
  }

  function log() {
    game.system.log.d("RollChat hasAppliedDamage", $hasAppliedDamage);
    game.system.log.d("RollChat appliedDamageByTarget", $appliedDamageByTarget);
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
    if (target.actor.type === "npc") {
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
</script>

<template lang="pug">
.FF15
  button.stealth.apply-trait(on:click="{log}")
    i.fa-solid.fa-bug
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
                          .flex1.right {displayVal(target, 'damage')}
                      +if("FFMessage.item.system?.hasDirectHit")
                        .flex1.formula.flexrow.justify-vertical.smaller
                          .flex3.left.font-cinzel.smallest Direct Hit 
                          .flex1.right {isHit(target) ? displayVal(target, 'directHit') : 'N/A'}
                    .flex0
                      .flexcol
                        .flex1
                          button.stealth.apply-trait(on:click!="{applyResult(target)}" disabled="{isApplyDisabled(target)}")
                            i.fa-solid.fa-check
                        .flex1
                          button.stealth.apply-trait(on:click!="{undoResult(target)}" disabled="{!isApplyDisabled(target)}")
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
