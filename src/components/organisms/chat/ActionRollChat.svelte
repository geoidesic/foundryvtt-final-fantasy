<script>
  game.system.log.d("race ---- START RollChat ----");
  import { onMount, getContext, tick } from "svelte";
  import { writable, derived } from "svelte/store";
  import { SYSTEM_ID } from "~/src/helpers/constants";
  import PortraitFrame from "~/src/components/molecules/PortraitFrame.svelte";

  export let FFMessage
  export let FFMessageState
  export let messageId
  export let content

  const item = fromUuidSync(FFMessage.item.uuid);
  game.system.log.d("race RollChat item", item);

  const message = getContext("message");

  game.system.log.d("race RollChat message", message);
  let showTraitButton = false;
  let totalRoll = 0;
  let isMounted = false;
  let targetTokens = [];

  $: actor = game.actors.get(FFMessage?.actor?._id);
  $: isApplyDisabled = (target)  => target.isUnlinked || FFMessageState.damageResults[target.id]?.applied;
  $: displayDamage = (target)  => FFMessageState.damageResults[target.id]?.damage;
  $: displayDirectHitDamage = (target)  =>
    isApplyDisabled(target) ? FFMessageState.damageResults[target.id]?.directHitResult : FFMessageState.damageResults[target.id]?.directHit;
  // $: displayVal = (target, type) =>  $displayValues.get(target.id)?.[type] || "";
  $: console.log("FFMessageState.damageResults", FFMessageState.damageResults);

  function getInitialDamageResults(passedTargets) {
    game.system.log.d("race setInitialDamageResults passedTargets", passedTargets);
    const initialDamageResults = new Map();
    for (const id of passedTargets) {
      let token = canvas.tokens.get(id);
      initialDamageResults.set(id, {
        damage: item.system?.formula,
        directHit: item.system?.directHitDamage,
        directHitResult: false,
        applied: false,
        originalHP: token.actor.system.points.HP.val,
        wasKOd: false,
      });
    }
    return initialDamageResults;
  }

  function getTargetTokens(targets) {
    return targets.map((id) => canvas.tokens.get(id));
  }

  function setTargetTokens(targets) {
    targetTokens = getTargetTokens(targets);
  }

  async function initializeStores() {
    if(FFMessageState.initialised) {
      setTargetTokens(FFMessage.targets);
      game.system.log.d("race ---- ALREADY INITIALIZED ABORTING INITIALIZE ----");
      return;
    }
    game.system.log.d("race ---- START INITIALIZE ----");

    if (FFMessage?.item?.type === "action") {
      const roll = FFMessage.roll;
      const item = FFMessage.item;
      const hasTargets = FFMessage.hasTargets;
      const modifier = FFMessage.extraModifiers?.modifier || 0;
      totalRoll = roll + modifier;

      // If we have targets, either load from flags or current targets
      if (hasTargets) {
        game.system.log.d("race hasTargets", hasTargets);

        let storedDamageResults = FFMessageState.damageResults;

        if (FFMessage.targets.length > 0) {
          game.system.log.d("race FFMessage.targets", FFMessage.targets);
          // Load targets from stored UUIDs
          game.system.log.d("race storedDamageResults", storedDamageResults);
          if (!storedDamageResults) {
            storedDamageResults = getInitialDamageResults(FFMessage.targets);
          }
          
          targetTokens = FFMessage.targets.map((id) => canvas.tokens.get(id));
          $message.update({
            flags: {
              [SYSTEM_ID]: {
                state: {
                  damageResults: Object.fromEntries(storedDamageResults),
                  initialised: true
                }
              },
            },
          });
        } else {
          game.system.log.d("race FFMessage.targets", FFMessage.targets);
          
          // Store current targets 
          $message.update({
            flags: {
              [SYSTEM_ID]: {
                state: {
                  damageResults: getInitialDamageResults(FFMessage.targets)
                }
              },
            },
          });
        }
      }
    }
  }

  onMount(async () => {
    game.system.log.d("race RollChat isMounted", isMounted);
    if (!isMounted) {
      game.system.log.d("race RollChat mounted", FFMessage);
      await initializeStores();
      game.system.log.d("race INITIIALIZED damageResults", FFMessageState.damageResults);
      isMounted = true;
    }
  });

  /**************
   * Apply Result
   **************/
  async function applyResult(target) {
    if (!target.actor || target.isUnlinked) return;

    game.system.log.d("race ---- START APPLY ----");

    const modifier = FFMessage.extraModifiers?.modifier || 0;
    let totalDamage = 0;
    const results = { damage: 0, directHit: 0 };

    // Calculate base damage
    if (item.system?.formula) {
      results.damage = parseInt(item.system.formula) || 0;
      totalDamage = results.damage;
    }

    // Calculate direct hit damage if applicable - only if it's a hit
    if (isHit(target) && item.system?.hasDirectHit && item.system?.directHitDamage) {
      const directHitRoll = await new Roll(item.system.directHitDamage).evaluate({ async: true });
      results.directHitResult = directHitRoll.total;
      totalDamage += results.directHitResult;
    } 

    // Apply damage to target
    const currentHP = target.actor.system.points.HP.val;
    const newHP = Math.max(0, currentHP - totalDamage);

    await target.actor.update({
      "system.points.HP.val": newHP,
    });

    // Toggle KO condition if HP drops to 0
    if (currentHP > 0 && newHP <= 0) {
      await target.actor.toggleStatusEffect("ko");
    }
    // Update stores
    game.system.log.r(FFMessageState.damageResults[target.id])
    const newDamageResults = {...FFMessageState.damageResults};
    newDamageResults[target.id].damage = results.damage;
    newDamageResults[target.id].directHitResult = results.directHitResult;
    newDamageResults[target.id].originalHP = currentHP;
    newDamageResults[target.id].applied = true;
    newDamageResults[target.id].wasKOd = currentHP > 0 && newHP <= 0;

    await $message.update({
      flags: {
        [SYSTEM_ID]: {
          state: {
            damageResults: newDamageResults
          }
        },
      },
    });

    game.system.log.d("race APPLY post update message", game.messages.get(messageId));
  }

  /**************
   * Undo Result
   **************/
  async function undoResult(target) {
    game.system.log.d("race ---- START UNDO ----");
    if (!target.actor || target.isUnlinked) return;

    const result = FFMessageState.damageResults[target.id]
    if (!result) return;

    // Restore original HP
    await target.actor.update({
      "system.points.HP.val": result.originalHP,
    });

    // Remove KO if we applied it
    if (result.wasKOd) {
      await target.actor.toggleStatusEffect("ko");
    }

    const newDamageResults = {...FFMessageState.damageResults};
    newDamageResults[target.id].applied = false;
    newDamageResults[target.id].wasKOd = false;

    await $message.update({
      flags: {
        [SYSTEM_ID]: {
          state: {  
            damageResults: newDamageResults
          }
        },
      },
    });

  }

  function log() {
    game.system.log.d("RollChat message", $message);
    game.system.log.d("RollChat damageResults", FFMessageState.damageResults);
  }

  async function applyTrait() {
    if (!item?.system?.enables?.list?.length) return;

    const trait = await fromUuid(item.system.enables.list[0].uuid);
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
.FF15.leather
  
  button.stealth.apply-trait(on:click="{log}")
    i.fa-solid.fa-bug
  .flexrow
    .flex0.portrait-frame.pr-xs.wide
      PortraitFrame.narrow.frame
        img.actor-img.clickable(src="{FFMessage?.actor?.img}" alt="{FFMessage?.actor?.name}" on:click!="{openActorSheet(actor)}")
    .flex3.content
      div {@html content}
  +if("FFMessage?.item?.type === 'action'")
    .flexrow
      .flex4
        .action-result
          +if("targetTokens.length === 0")
            .no-targets No targets selected. Select targets and roll again.
            +else
              .target-list
                +each("targetTokens as target")
                  .leatherbook
                    .background
                      .texture
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
                        .flex2.thin-border.bg-gold.offwhite
                          +if("item.system?.formula")
                            .flex1.formula.flexrow.justify-vertical
                              .flex3.left.font-cinzel.smaller Damage 
                              .flex1.right {displayDamage(target)}
                          +if("item.system?.hasDirectHit")
                            .flex1.formula.flexrow.justify-vertical.smaller
                              .flex3.left.font-cinzel.smaller Direct Hit 
                              .flex1.right {isHit(target) ? displayDirectHitDamage(target) : 'N/A'}
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

.portrait-frame
  margin-right: -2px
  z-index: 2
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

.leatherbook
  +background(rgb(98 49 50), 0.05, none )
</style>
