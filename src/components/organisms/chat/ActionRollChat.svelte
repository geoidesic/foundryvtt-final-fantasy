<script>
  // game.system.log.d("race ---- START RollChat ----");
  import { onMount, getContext, setContext, tick } from "svelte";
  import { writable, derived } from "svelte/store";
  import { SYSTEM_ID } from "~/src/helpers/constants";
  import { TJSDocument } from "#runtime/svelte/store/fvtt/document";
  import { createDamageText } from "~/src/helpers/canvas";
  import { localize } from "~/src/helpers/util";
  
  import PortraitFrame from "~/src/components/molecules/PortraitFrame.svelte";
  import ChatTitle from "~/src/components/molecules/chat/actionRoll/ChatTitle.svelte";
  import Header from "~/src/components/organisms/item/type/action/Header.svelte";
  import Meteor from "~/src/components/atoms/meteor.svelte";

  export let FFMessage
  export let FFMessageState
  export let content
  export let classes = ''
  export let messageId

  const item = fromUuidSync(FFMessage.item.uuid);
  if(item) {
    const Item = new TJSDocument()
    Item.set(item);
    setContext("#doc", Item);
  }

  const message = getContext("message");

  let showTraitButton = false;
  let totalDamage = 0;
  let isMounted = false;
  let targetTokens = false;
  let showDescription = false;
  let roll = 0;
  let hasTargets = false;

  $: actor = game.actors.get(FFMessage?.actor?._id);
  $: isApplyDisabled = (target)  => target.isUnlinked || FFMessageState.damageResults[target.id]?.applied;
  $: displayDamage = (target)  => FFMessageState.damageResults[target.id]?.damage;
  $: displayDamageFormula = (target)  => FFMessageState.damageResults[target.id]?.baseDamageFormula;
  $: displayDirectHitDamage = (target)  =>
    isApplyDisabled(target) ? FFMessageState.damageResults[target.id]?.directHitResult : FFMessageState.damageResults[target.id]?.directHit;
  // $: displayVal = (target, type) =>  $displayValues.get(target.id)?.[type] || "";
  $: displayDirectHitDisplayFormula = (target) => FFMessageState.damageResults[target.id]?.directHitDisplayFormula;
  
  $: showProfileImage = game.settings.get(SYSTEM_ID,'showChatProfileImages');

  $: roll = FFMessage?.roll || 0;
  $: penalty = FFMessage?.extraModifiers?.penalty || 0;
  $: totalRoll = roll - penalty;
  $: hasTargets = FFMessage?.hasTargets || false;

  function log() {
    game.system.log.b("RollChat roll", roll);
    game.system.log.b("RollChat penalty", penalty);
    game.system.log.b("RollChat totalRoll", totalRoll);
    game.system.log.b("RollChat totalDamage", totalDamage);
    game.system.log.b("RollChat hasTargets", hasTargets);
    game.system.log.b("RollChat item?.system?.hasDirectHit", item?.system?.hasDirectHit);
    game.system.log.b("RollChat item?.system?.directHitDamage", item?.system?.directHitDamage);
    game.system.log.b("RollChat item?.currentUses", item?.currentUses);
    game.system.log.b("RollChat $message", $message);
    game.system.log.b("RollChat FFMessage", FFMessage);
    game.system.log.b("RollChat FFMessage.isCritical", FFMessage.isCritical);
    game.system.log.b("RollChat item", item);
  }

  function getDamageResults(passedTargets) {
    const DamageResults = new Map();
    for (const id of passedTargets) {
      let token = canvas.tokens.get(id);
      
      // Handle base damage formula
      let baseEffectDamage = item?.system?.baseEffectDamage;
      if (FFMessage?.isCritical && baseEffectDamage) {
        // Double the number of dice for critical hits
        baseEffectDamage = baseEffectDamage.replace(/(\d+)d(\d+)/g, (match, count, sides) => {
          return `${parseInt(count, 10) * 2}d${sides}`;
        });
      }

      // For direct hit, we'll use the original formula, handle critical hits, and let the hooks handle modifications
      const directHitDamage = item?.system?.directHitDamage;

      const baseDamageFormula = item?.system?.hasSplitDamage 
        ? `Split BaseDamage (${baseEffectDamage} ÷ ${passedTargets.length})`
        : `Base Damage (${baseEffectDamage})`;

      const directHitDisplayFormula = item?.system?.hasSplitDamage
        ? `Split Direct Hit (${directHitDamage} ÷ ${passedTargets.length})`
        : `Direct Hit (${directHitDamage})`;

      const damageResult = {
        damage: baseEffectDamage,
        healing: item?.system?.baseEffectHealing,
        baseDamageFormula,
        directHit: item?.system?.hasDirectHit ? directHitDamage : null,
        directHitFormula: item?.system?.hasDirectHit ? directHitDamage : null,
        directHitDisplayFormula: item?.system?.hasDirectHit ? directHitDisplayFormula : null,
        directHitResult: false,
        applied: false,
        originalHP: token.actor?.system.points.HP.val,
        wasKOd: false,
      };

      DamageResults.set(id, damageResult);
    }

    /**
     *  @why callAll? - We need callAll because multiple game features or modules 
     * might need to modify the damage calculation independently 
     * - for example, one module might add elemental damage while another adds
     *  status effect bonuses. Using call would only allow the first modification
     *  to occur.
    */
    if (DamageResults.size > 0) {
      Hooks.callAll('FF15.processAdditionalBaseDamageFromItem', {item, actor, DamageResults});
      Hooks.callAll('FF15.DamageDiceReroll', {
        item, 
        actor, 
        DamageResults, 
        isCritical: FFMessage?.isCritical
      });
    }

    return DamageResults;
  }

  function getTargetTokens(targets) {
    if(!targets.length) return [];
    return targets.map((id) => canvas?.tokens?.get(id));
  }

  function setTargetTokens(targets) {
    targetTokens = getTargetTokens(targets);
  }

  async function initializeStores() {
    if (FFMessage?.item?.type === "action" && hasTargets) {
      let storedDamageResults = FFMessageState.damageResults;

      if (FFMessage.targets.length > 0) {
        if (!storedDamageResults && !FFMessageState.initialised) {
          storedDamageResults = getDamageResults(FFMessage.targets);
          
          if ($message) {
            await $message.update({
              flags: {
                [SYSTEM_ID]: {
                  state: {
                    damageResults: Object.fromEntries(storedDamageResults),
                    initialised: true
                  }
                },
              },
            });
          }
        }
        
        // Wait for canvas to be ready before getting tokens
        if (canvas.ready) {
          targetTokens = FFMessage.targets.map((id) => canvas.tokens.get(id)).filter(Boolean);
        } else {
          // If canvas isn't ready, wait for it
          Hooks.once('canvasReady', () => {
            targetTokens = FFMessage.targets.map((id) => canvas.tokens.get(id)).filter(Boolean);
          });
        }
      }
    }
  }

  onMount(async () => {
    if (!isMounted) {
      await initializeStores();
      isMounted = true;
    }
    game.system.log.o('[ACTION ROLL CHAT] Mounted targetTokens', targetTokens);
  });

  /**************
   * Apply Result
   **************/
  async function applyResult(target) {
    if (isApplyDisabled(target)) return;

    // Immediately update the message state to disable the button
    const newDamageResults = {...FFMessageState.damageResults};
    newDamageResults[target.id] = {
      ...newDamageResults[target.id],
      applied: true
    };
    await $message.update({
      flags: {
        [SYSTEM_ID]: {
          state: {  
            damageResults: newDamageResults
          }
        },
      },
    });

    const token = canvas.tokens.get(target.id);
    if (!token) return;

    const damageResults = FFMessageState.damageResults[target.id];
    if (!damageResults) return;

    // Calculate base damage
    const baseDamage = parseInt(damageResults.damage) || 0;
    let directHitDamage = 0;

    // Calculate direct hit damage if applicable - only if it's a hit
    if (isHit(target) && item?.system?.hasDirectHit && item?.system?.directHitDamage) {
      if (damageResults.directHit.includes('d')) {
        const directHitRoll = await new Roll(damageResults.directHit).evaluate({ async: true });
        if (game.modules.get('dice-so-nice')?.active) {
          await game.dice3d.showForRoll(directHitRoll);
        }
        directHitDamage = directHitRoll.total;
      } else {
        directHitDamage = parseInt(damageResults.directHit) || 0;
      }
    }

    const totalDamage = baseDamage + directHitDamage;
    
    game.system.log.o('[DAMAGE] Calculating total:', {
      baseDamage,
      directHitDamage,
      totalDamage
    });
    
    createDamageText(token, totalDamage);

    // Handle barrier points first
    const currentBP = token.actor.system.points.BP.val;
    let remainingDamage = totalDamage;
    let newBP = currentBP;

    game.system.log.o('[BARRIER] Before damage application:', {
      currentBP,
      totalDamage,
      remainingDamage
    });

    if (currentBP > 0) {
      // If we have barrier points, reduce them first
      if (currentBP >= totalDamage) {
        // Barrier absorbs all damage
        newBP = currentBP - totalDamage;
        remainingDamage = 0;
      } else {
        // Barrier absorbs some damage
        remainingDamage = totalDamage - currentBP;
        newBP = 0;
      }

      game.system.log.o('[BARRIER] After barrier calculation:', {
        newBP,
        remainingDamage
      });

      // Update barrier points
      await token.actor.update({ "system.points.BP.val": newBP });
    }

    // Update the actor's HP with remaining damage
    const currentHP = token.actor.system.points.HP.val;
    const newHP = Math.max(currentHP - remainingDamage, 0);
    game.system.log.o('[KO CHECK] Before HP update:', {
      currentHP,
      remainingDamage,
      newHP
    });

    await token.actor.update({ "system.points.HP.val": newHP });

    game.system.log.o('[KO CHECK] After HP update:', {
      updatedCurrentHP: token.actor.system.points.HP.val,
      hasKoStatus: token.actor.statuses.has('ko')
    });

    // Toggle KO if HP is 0 and not already KO'd
    if (token.actor.system.points.HP.val === 0 && !token.actor.statuses.has('ko')) {
      game.system.log.o('[KO CHECK] Applying KO status');
      await token.actor.toggleStatusEffect("ko");
      game.system.log.o('[KO CHECK] KO status applied');
    }

    // Update the final state with all the results
    newDamageResults[target.id] = {
      ...newDamageResults[target.id],
      wasKOd: newHP <= 0,
      directHitResult: directHitDamage
    };

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

  /**************
   * Undo Result
   **************/
  async function undoResult(target) {
    if (!target.actor || target.isUnlinked) return;

    const token = canvas.tokens.get(target.id);
    if (!token) return;

    const result = FFMessageState.damageResults[target.id];
    if (!result || !result.applied) return;  // Only undo if it was actually applied

    const currentHP = token.actor.system.points.HP.val;
    const originalHP = result.originalHP;

    // Only restore HP if it's different from the original
    if (currentHP !== originalHP) {
      createDamageText(token, originalHP - currentHP, true);
      await token.actor.update({
        "system.points.HP.val": originalHP
      });
    }

    // Only remove KO if we applied it
    if (result.wasKOd) {
      await token.actor.toggleStatusEffect("ko");
    }

    // Update only this target's results in the message state
    const newDamageResults = {...FFMessageState.damageResults};
    newDamageResults[target.id] = {
      ...newDamageResults[target.id],
      applied: false,
      wasKOd: false,
      directHitResult: false
    };

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


  async function applyTrait() {
    if (!item?.system?.enables?.list?.length) return;

    const trait = await fromUuid(item?.system?.enables?.list[0].uuid);
    if (!trait) return;

    // Apply trait to all existing targets
    for (const target of targets) {
      if (target?.actor && !target?.isUnlinked) {
        await target?.actor?.createEmbeddedDocuments("Item", [trait]);
      }
    }

    showTraitButton = false;
  }

  function getDefenseValue(target) {
    if (target?.isUnlinked || !target?.actor?.system?.attributes) return 0;

    // For NPCs, defense is directly in attributes
    if (target?.actor?.type === "npc") {
      const defense = target?.actor?.system?.attributes?.defence?.val || 0;
      return defense;
    }

    // For PCs, defense is in secondary attributes
    const defense = target?.actor?.system?.attributes?.secondary?.def?.val || 0;
    const magicDefense = target?.actor?.system?.attributes?.secondary?.mag?.val || 0;
    return Math.max(defense, magicDefense);
  }

  function isHit(target) {
    return totalRoll >= getDefenseValue(target);
  }

  function getTargetImage(target) {
    if (target?.isUnlinked) return null;
    return target?.document?.texture?.src || target?.actor?.img;
  }

  function openActorSheet(actor) {
    if (!actor) return;
    actor?.sheet?.render(true);
  }

  const handleToggleDescription = () => {
    showDescription = !showDescription;
  };
</script>

<template lang="pug">

.chat
  div.pointer(role="button" on:click!="{log}") 
    i.fa-solid.fa-bug
  ChatTitle(on:toggleDescription="{handleToggleDescription}")
  .description-wrapper(class="{showDescription ? 'expanded' : ''}")
    .flexrow.mt-xs(class="{showDescription ? 'visible' : ''}")
      .flex4#chat-description.inset {@html item?.system?.description}
        Header
  +if("content")
    .flexrow.gap-4.leather.mt-xs
      .flex3.content
        div {@html content}
  +if("FFMessage?.item?.type === 'action' && item && targetTokens.length")
    .action-result
      .target-list
        +each("targetTokens as target")
          //- wait for target to be defined
          +if("target") 
            .leatherbook
              .background
                .texture
                .target-row.flexrow(class="{target.isUnlinked ? 'unlinked' : ''}")
                  .flex3
                    .flexrow.justify-vertical.gap-4
                      .flex0.target-info.pointer
                        +if("target && !target.isUnlinked")
                          img.target-img.clickable(src="{getTargetImage(target)}" alt="{target.name}" on:click!="{openActorSheet(target.actor)}")
                      .flex1.flexcol.thin-border
                        .col.target-name.font-cinzel.smaller {target.name}
                        .col.flexrow.justify-vertical.no-wrap
                          .flex1.left.font-cinzel(data-tooltip-class="FF15-tooltip" data-tooltip="Defense") DEF 
                          .flex1.m1-xs.left {getDefenseValue(target)}
                          .flex1.relative.right
                            +if("FFMessage?.isCritical")
                              .critical
                                Meteor(fill="var(--ff-border-color)" innerFill="var(--message-color)" innerOpacity="1" opacity="1" size="25")
                                .overlay(style="margin: 0; font-size: 1rem; color: #fff") 
                                  i.icon.fa-solid.bg-white.round(data-tooltip="{localize('CriticalSuccess')}" class="{isHit(target) ? 'fa-circle-check positive' : 'fa-circle-xmark negative'}")
                              +else
                                i.icon.fa-solid.bg-white.round(data-tooltip="{isHit(target) ? localize('DirectHit') : localize('DirectHitMissed')}" class="{isHit(target) ? 'fa-circle-check positive' : 'fa-circle-xmark negative'}")
                  
                  .flex2.thin-border.offwhite(style="min-height: 2.6rem" class="{isApplyDisabled(target) ? 'bg-silver' : 'bg-gold'}")
                    +if("item?.system?.baseEffectDamage")
                      .flex1.formula.flexrow.justify-vertical.active(data-tooltip-class="FF15-tooltip" data-tooltip="{displayDamageFormula(target)}")
                        .flex3.left.font-cinzel.smaller Damage 
                        .flex1.right.no-wrap {displayDamage(target)}
                    +if("item?.system?.hasDirectHit")
                      .flex1.formula.flexrow.justify-vertical.smaller(data-tooltip-class="FF15-tooltip" data-tooltip="{displayDirectHitDisplayFormula(target)}")
                        .flex3.left.font-cinzel.even-smaller Direct Hit 
                        .flex1.right.no-wrap {isHit(target) ? displayDirectHitDamage(target) : 'N/A'}
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
@use '../../../styles/_mixins' as mixins

.description-wrapper
  +mixins.description-wrapper

.inset
  +mixins.inset

:global(.FF15 #chat-description)
  background: url('/systems/foundryvtt-final-fantasy/assets/parchment4.webp')
  color: var(--color-text-dark)
  padding: 0.2rem 0.5rem
  margin-top: 0.2rem

:global(.FF15 #chat-description p)
  font-size: 0.7rem
  line-height: 1.2rem
  font-family: "Trirong", serif



.action-result
  margin-top: 0.2em
  background: rgba(0, 0, 0, 0.05)
  border-radius: 3px

.target-list
  display: flex
  flex-direction: column
  gap: 0.2em

.target-row
  display: flex
  justify-content: space-between
  align-items: center
  padding: 0.1em 0.3em
  background: rgba(0, 0, 0, 0.3)
  border-radius: 3px
  border: 3px outset rgba(0, 0, 0, 0.1)
  &.unlinked
    opacity: 0.7
    background: rgba(0, 0, 0, 0.05)
    .target-name
      font-style: italic

.target-info
  display: flex
  align-items: center
  gap: 0.5em
  position: relative
  flex: 0 0 45px
  img.target-img
    object-fit: cover
    border-radius: var(--border-radius)


button:disabled
  opacity: 0.3
  cursor: not-allowed

.leatherbook
  +mixins.background(rgb(98 49 50), 0.05, none)

.critical
  position: relative
  color: #ffd700
  text-shadow: 0 0 3px rgba(255, 215, 0, 0.5)
  animation: pulse 1s infinite
  width: 25px
  height: 25px
  margin-top: -5px

.overlay
  position: absolute
  top: 57%
  left: 48%
  transform: translate(-50%, -50%)
  font-weight: bold
  pointer-events: none
  width: 0
  height: 0
  display: flex
  align-items: center
  justify-content: center

.icon
  font-size: 14px

@keyframes pulse
  0%
    opacity: 1
  50%
    opacity: 0.7
  100%
    opacity: 1
</style>
