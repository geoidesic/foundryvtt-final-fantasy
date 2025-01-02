<script>
  // game.system.log.d("race ---- START RollChat ----");
  import { onMount, getContext, setContext, tick } from "svelte";
  import { writable, derived } from "svelte/store";
  import { SYSTEM_ID } from "~/src/helpers/constants";
  import { TJSDocument } from "@typhonjs-fvtt/runtime/svelte/store/fvtt/document";

  import PortraitFrame from "~/src/components/molecules/PortraitFrame.svelte";
  import ChatTitle from "~/src/components/molecules/chat/actionRoll/ChatTitle.svelte";
  import Header from "~/src/components/organisms/item/type/action/Header.svelte";

  export let FFMessage
  export let FFMessageState
  export let messageId
  export let content

  const item = fromUuidSync(FFMessage.item.uuid);
  if(item) {
    const Item = new TJSDocument()
    Item.set(item);
    setContext("#doc", Item);
  }

  const message = getContext("message");

  let showTraitButton = false;
  let totalRoll = 0;
  let isMounted = false;
  let targetTokens = [];
  let showDescription = false;

  $: actor = game.actors.get(FFMessage?.actor?._id);
  $: isApplyDisabled = (target)  => target.isUnlinked || FFMessageState.damageResults[target.id]?.applied;
  $: displayDamage = (target)  => FFMessageState.damageResults[target.id]?.damage;
  $: displayDamageFormula = (target)  => FFMessageState.damageResults[target.id]?.baseDamageFormula;
  $: displayDirectHitDamage = (target)  =>
    isApplyDisabled(target) ? FFMessageState.damageResults[target.id]?.directHitResult : FFMessageState.damageResults[target.id]?.directHit;
  // $: displayVal = (target, type) =>  $displayValues.get(target.id)?.[type] || "";

  $: showProfileImage = game.settings.get(SYSTEM_ID,'showChatProfileImages');

  function getDamageResults(passedTargets) {
    
    const DamageResults = new Map();
    for (const id of passedTargets) {
      let token = canvas.tokens.get(id);
      DamageResults.set(id, {
        damage: item.system?.formula,
        baseDamageFormula: `Base Damage (${item.system?.formula})`,
        directHit: item.system?.directHitDamage,
        directHitFormula: item.system?.directHitDamage,
        directHitResult: false,
        applied: false,
        originalHP: token.actor.system.points.HP.val,
        wasKOd: false,
      });
    }

    /**
     *  @why callAll? - We need callAll because multiple game features or modules 
     * might need to modify the damage calculation independently 
     * - for example, one module might add elemental damage while another adds
     *  status effect bonuses. Using call would only allow the first modification
     *  to occur.
    */
    Hooks.callAll('FF15.processAdditionalBaseDamageFromItem', {item, actor, DamageResults});
    Hooks.callAll('FF15.RerollDamageDice', {item, actor, DamageResults});
    return DamageResults;
  }

  function getTargetTokens(targets) {
    if(!targets.length) return [];
    return targets.map((id) => canvas.tokens.get(id));
  }

  function setTargetTokens(targets) {
    targetTokens = getTargetTokens(targets);
  }

  async function initializeStores() {
    if(FFMessageState.initialised) {
      setTargetTokens(FFMessage.targets);
      return;
    }

    if (FFMessage?.item?.type === "action") {
      const roll = FFMessage.roll;
      const item = FFMessage.item;
      const hasTargets = FFMessage.hasTargets;
      const modifier = FFMessage.extraModifiers?.modifier || 0;
      totalRoll = roll + modifier;

      // If we have targets, either load from flags or current targets
      if (hasTargets) {

        let storedDamageResults = FFMessageState.damageResults;

        if (FFMessage.targets.length > 0) {
          // Load targets from stored UUIDs
          if (!storedDamageResults) {
            storedDamageResults = getDamageResults(FFMessage.targets);
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
          // Store current targets 
          $message.update({
            flags: {
              [SYSTEM_ID]: {
                state: {
                  damageResults: getDamageResults(FFMessage.targets)
                }
              },
            },
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
  });

  /**************
   * Apply Result
   **************/
  async function applyResult(target) {
    if (!target.actor || target.isUnlinked) return;


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

  }

  /**************
   * Undo Result
   **************/
  async function undoResult(target) {
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

  const handleToggleDescription = () => {
    showDescription = !showDescription;
  };
</script>

<template lang="pug">

.chat
  ChatTitle(on:toggleDescription="{handleToggleDescription}")
  .description-wrapper(class="{showDescription ? 'expanded' : ''}")
    +if("showDescription")
      .flexrow.mt-xs
        .flex4#chat-description.inset {@html item.system.description}
          Header
  +if("content")
    .flexrow.gap-4.leather.mt-xs
      .flex3.content
        div {@html content}
  +if("FFMessage?.item?.type === 'action'")
    .action-result
      .target-list
        +each("targetTokens as target")
          .leatherbook
            .background
              .texture
              .target-row.flexrow(class="{target.isUnlinked ? 'unlinked' : ''}")
                .flex3
                  .flexrow.justify-vertical.gap-4
                    .flex0.target-info.pointer
                      +if("!target.isUnlinked")
                        img.target-img.clickable(src="{getTargetImage(target)}" alt="{target.name}" on:click!="{openActorSheet(target.actor)}")
                    .flex1
                      .target-name.font-cinzel.smaller {target.name}
                .flex1.thin-border
                  .flexcol
                    .col.target-defense.flexrow.justify-vertical.no-wrap
                      .flex1.left.font-cinzel.smallest(data-tooltip-class="FF15-tooltip" data-tooltip="Defense") DEF 
                      .flex1.m1-xs.center {getDefenseValue(target)}
                    .col.flexrow.justify-vertical.no-wrap
                      .flex2.font-cinzel.smallest {isHit(target) ? "Hit" : "Miss"}
                      .flex1
                        i.fa-solid.bg-white.round(class="{isHit(target) ? 'fa-circle-check positive' : 'fa-circle-xmark negative'}")
                .flex2.thin-border.bg-gold.offwhite(style="min-height: 2.6rem")
                  +if("item.system?.formula")
                    .flex1.formula.flexrow.justify-vertical.active(data-tooltip-class="FF15-tooltip" data-tooltip="{displayDamageFormula(target)}")
                      .flex3.left.font-cinzel.smaller Damage 
                      .flex1.right.no-wrap {displayDamage(target)}
                  +if("item.system?.hasDirectHit")
                    .flex1.formula.flexrow.justify-vertical.smaller
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
@import '../../../styles/Mixins.sass'

.description-wrapper
  max-height: 0
  overflow: hidden
  transition: max-height 0.3s ease-out
  &.expanded
    max-height: 500px  // Large enough to fit most descriptions

.inset
  +inset
:global(.FF15 #chat-description)
  background: url('/systems/foundryvtt-final-fantasy/assets/parchment4.webp')
  color: var(--color-text-dark)
  padding: 0.2rem 0.5rem
  margin-top: 0.2rem
:global(.FF15 #chat-description p)
  font-size: 0.7rem
  line-height: 1.2rem
  font-family: "Trirong", serif

.portrait-frame
  margin-right: -2px
  z-index: 2
.img, img
  max-width: 35px
  max-height: 35px

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
  
  .target-img
    width: 36px
    height: 36px
    border: none
    position: relative
    
    // Add corner elements for tooltips
    &[data-tooltip]::after
      content: ''
      position: absolute
      
    &[data-tooltip]::before,
    &[data-tooltip] .corner-tl,
    &[data-tooltip] .corner-tr,
    &[data-tooltip] .corner-bl,
    &[data-tooltip] .corner-br
      content: ''
      position: absolute
      width: 10px
      height: 10px
      pointer-events: none
      z-index: 1
  
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

.portrait-frame
  // margin-right: 5px
  & + .content
    display: flex
    flex-direction: column
    gap: 5px


</style>
