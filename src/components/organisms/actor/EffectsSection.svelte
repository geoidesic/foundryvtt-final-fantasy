<script>
  import { getContext, onMount } from "svelte";
  import { rippleFocus } from "#standard/action/animate/composable";
  import { TJSDocument } from "#runtime/svelte/store/fvtt/document";

  import { TJSInput } from "#standard/component/form";
  import { createFilterQuery } from "~/src/filters/itemFilterQuery";
  import { getEffectOrigin } from "~/src/helpers/util";
  import { localize } from "#runtime/util/i18n";
  import { SYSTEM_ID, SYSTEM_CODE } from "~/src/helpers/constants";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import ScrollingContainer from "~/src/helpers/svelte-components/ScrollingContainer.svelte";
  import InventoryRow from "~/src/components/molecules/InventoryRow.svelte";
  import RollCalcActor from "~/src/helpers/RollCalcActor";
  import Badge from "~/src/components/atoms/Badge.svelte";

  const Actor = getContext("#doc");
  const doc = new TJSDocument($Actor);
  const triggerSearch = createFilterQuery("trigger");
  const nameSearch = createFilterQuery("label");
  const input = {
    store: nameSearch,
    efx: rippleFocus(),
    placeholder: "*",
    type: "search",
    id: "search"
  };

  /** @type {import('@typhonjs-fvtt/runtime/svelte/store').DynMapReducer<string, Item>} */
  const wildcardConfig = doc.embedded.create(Item, {
    name: "wildcard",
    filters: [nameSearch, triggerSearch],
  });


  /** @type {import('@typhonjs-fvtt/runtime/svelte/store').DynMapReducer<string, Item>} */
  let wildcard = doc.embedded.create(ActiveEffect, wildcardConfig);

  let combat;
  

  function debug(val) {
    game.system.log.d(val);
    game.system.log.d('sheet', sheet);
  }
  function dataTooltip(effect) {
    return effect.isSuppressed ? "Disabled because the item granting this is not equipped" : "SURGE.ToggleEnabled";
  }
  function toggleLock(event) {
    $doc.update(
      {
        ["system.effectActionsLocked"]: !$doc.system.effectActionsLocked,
      },
      {
        diff: true,
        diffData: true,
        diffSystem: true,
      },
    );
  }
  function toggleEffect(effect) {
    if (effect instanceof ActiveEffect) {
      const origin = getEffectOrigin(effect);
      if (origin instanceof Item && effect.isSuppressed) {
        ui.notifications.warn(
          "This effect is currently suppressed, probably because the item that grants it is not equipped.",
        );
        return;
      }
    }
    effect.update({ disabled: !effect.disabled });
  }
  function openItem(index, item) {
    item.sheet.render(true);
  }
  // @todo: could convert this to an IconSelect, which provides better state handling (i.e. currently this select will show an incorrect value if the update fails until the Application is reloaded)
  async function updateTrigger(effect, event) {
    try {
      await effect.update({ [`flags.${SYSTEM_ID}.trigger`]: event.target.value });
    } catch (error) {
      ui.notifications.notify(error.message, "error");
    }
  }

  function getAvatarForVersion(source, version) {
    return version < 12 ? source.icon : source.img
  }
  
  $: ActiveEffects = [...$wildcard]
    .filter(effect => !effect.disabled)
    .map((effect) => {
      // const originInstance = getEffectOrigin(effect, true);
      // if(!effect.flags[SYSTEM_ID]) effect.flags[SYSTEM_ID] = {};
      // effect.flags[SYSTEM_ID].originInstance = originInstance;
      return effect
    });
  $: lockCSS = $doc.system.effectActionsLocked ? "lock" : "lock-open";
  $: faLockCSS = $doc.system.effectActionsLocked ? "fa-lock negative" : "fa-lock-open positive";
  $: xpUnspent = parseInt($doc.system.xp?.unspent) || 0;

</script>

<template lang="pug">
.effects({...$$restProps})
  +if("ActiveEffects.length > 0")
    h2.font-cinzel {localize('FF15.Effects')}
    div.px-xs
      +if("ActiveEffects.length > 0")

        table.borderless.low-contrast
              
          +each("ActiveEffects as item, index")
            tr
              td.img.shrink(scope="col")
                img.icon(src="{item.img}" alt="{item.name}")
              td.left
                a.ml-sm.stealth.link.no-wrap(on:click="{openItem(index, item)}") {localize(item.name)}

    +else
      p(style="margin-top: -2px; margin-bottom: 0px;") {localize("FF15.NoEffects")}
</template>

<style lang="sass">
@import '../../../styles/Mixins.sass'
.favourites
  +inset(0.5rem, 0 0 5px rgba(165,0,0,1) inset)
  width: 100%
.fa-bookmark
  color: var(--color-highlight) !important
.portrait-frame
  margin-right: -2px
  z-index: 2
.pulse
  @include pulse

  .buttons
    @include buttons

.actions
  margin-left: 0.5rem
  margin-right: 0
  justify-content: right
  :not(:last-child)
    margin-right: 2px

.clickable
  max-height: 1.3rem
  line-height: 1.3rem
  background: rgba(255, 255, 255, 0.2)

i.disable
  color: grey
  cursor: not-allowed

.fa-bookmark
  cursor: pointer
  &.row
    color: rgba(100, 0, 100, 1)

ol
  height: 100%
  margin: 0
  padding: 0.1rem
  border: 1px solid grey
  li
    padding: 3px
    margin: 0 2px 2px 2px
    align-items: center
    &:not(.header):not(.footer)
      background-color: #cdc8c7
    &.header
      padding: 0 3px
      line-height: 1rem
      text-align: top
      justify-content: top
      border-bottom-left-radius: 0
      border-bottom-right-radius: 0
      margin-bottom: 0
      border-bottom: none

.itemrow
  height: 1.9rem

.rowimgbezelbutton
  border-style: solid
  border-width: 1px
  border-color: #bbb #aaa #999
  text-shadow: 0 1px 0 #eee
  background: #ccc
  color: #333
  font-family: "Lucida Grande"
  font-size: 12px
  font-weight: bold
  text-decoration: none
  -webkit-border-radius: 3px
  -webkit-box-shadow: inset 0 1px 1px #fff, inset 0 -1px 1px #aaa, 0 2px 4px -3px #666
  &.lock-open
    background-color: #19762d
    color: white
  &.lock
    background-color: #9c0f0f
    color: white

.rowimgbezelbutton:active
  -webkit-box-shadow: inset 0 1px 1px #aaa, inset 0 -1px 1px #aaa
  border-color: #888 #aaa #eee

input
  background-color: white
  height: 1.2rem
       
td
  &.clip
    text-overflow: ellipsis
    overflow: hidden
    height: 2rem
    max-height: 2rem
    display: block
</style>
