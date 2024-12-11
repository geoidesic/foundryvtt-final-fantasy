<svelte:options accessors={true} />

<script>
  import { getContext, setContext, onMount, onDestroy } from "svelte";
  import { rippleFocus } from "@typhonjs-fvtt/runtime/svelte/action/animate";
  import { TJSInput } from "@typhonjs-fvtt/svelte-standard/component";
  import { createFilterQuery } from "~/src/filters/itemFilterQuery";
  import { TJSDocument } from "@typhonjs-fvtt/runtime/svelte/store/fvtt/document";
  import { getEffectOrigin } from "~/src/helpers/util";
  import ScrollingContainer from "~/src/helpers/svelte-components/ScrollingContainer.svelte";

  export let sheet;
  export function resetEffectList() {
    game.system.log.d("resetEffectList");
    filterDoc = new TJSDocument($doc);
    wildcard = filterDoc.embedded.create(ActiveEffect, wildcardConfig);
  }

  let key = false,
    keyUp = true,
    prevValue,
    triggerFilterValue,
    ActiveEffects = [];
  // const documentStore = getContext("#doc");
  const doc = getContext("#doc");
  const app = getContext("#external").application;

  const triggerSearch = createFilterQuery("trigger");
  const nameSearch = createFilterQuery("label");
  const wildcardConfig = {
    name: "wildcard",
    filters: [nameSearch, triggerSearch],
    // filters: [nameSearch],
  };
  let filterDoc = new TJSDocument($doc);

  const input = {
    store: nameSearch,
    efx: rippleFocus(),
    placeholder: "*",
    type: "search",
    id: "search"
  };

  /** @type {import('@typhonjs-fvtt/runtime/svelte/store').DynMapReducer<string, Item>} */
  let wildcard = filterDoc.embedded.create(ActiveEffect, wildcardConfig);

  function debug(val) {
    game.system.log.d(val);
    game.system.log.d('sheet', sheet);
  }
  function dataTooltip(effect) {
    return effect.isSuppressed ? "Disabled because the item granting this is not equipped" : "SURGE.ToggleEnabled";
  }
  async function deleteItem(index, effect) {
    if (isPassiveEffectFromItem(effect)) {
      ui.notifications.warn("This effect is granted by an item. To remove the effect, you can remove the item.");
      return;
    }
    await effect.delete();
    // reset the data for the filter
    resetEffectList();
  }
  function editItem(index, item) {
    game.system.log.d(item);
    item.sheet.render(true);
  }
  async function removeAllEffects() {
    const confirmed = await Dialog.confirm({
      title: "Remove All Effects",
      content: "Are you sure you want to remove all effects?",
      yes: async () => {
        for(let effect of $doc.effects) {
          await effect.delete();
        }
      },
      no: () => {},
    });
    
  }
  function isPassiveEffectFromItem(item) {
    game.system.log.d("isPassiveEffectFromItem item", item);
    if (item instanceof ActiveEffect) {
      const origin = getEffectOrigin(item, true);
      const parent = item.parent;
      if (
        parent instanceof Actor &&
        origin instanceof Item &&
        origin.type != "effect" &&
        item.flags?.surge?.trigger != "contact"
      ) {
        return true;
      }
    }
    return false;
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
  async function openActiveEffectEditor() {
    game.system.log.d("openActiveEffectEditor");
    const effect = await ActiveEffect.create(
      {
        label: $doc.name,
        icon: $doc.img,
        origin: $doc.uuid,
        disabled: false,
        transfer: true,
        flags: {
          surge: {
            source: "user",
            trigger: "passive",
          },
        },
      },
      { parent: $doc },
    );

    game.system.log.d("effect", effect);

    const effectConfig = new ActiveEffectConfig(effect, { editable: true });
    effectConfig.render(true);
  }
  // @todo: could convert this to an IconSelect, which provides better state handling (i.e. currently this select will show an incorrect value if the update fails until the Application is reloaded)
  async function updateTrigger(effect, event) {
    try {
      await effect.update({ ["flags.surge.trigger"]: event.target.value });
    } catch (error) {
      ui.notifications.notify(error.message, "error");
    }
  }

  function getAvatarForVersion(source, version) {
    return version < 12 ? source.icon : source.img
  }
  
  onMount(() => {
    Hooks.on('createActiveEffect', resetEffectList);
    Hooks.on('deleteActiveEffect', resetEffectList);

    game.system.log.d("EffectsTab mounted");
    game.system.log.d(ActiveEffects);
  });
  onDestroy(() => {
    Hooks.off('createActiveEffect', resetEffectList);
    Hooks.off('deleteActiveEffect', resetEffectList);

    game.system.log.d("EffectsTab onDestroy");
    game.system.log.d(ActiveEffects);
  });

  // $: ActiveEffects = $filterDoc.effects;
  $: ActiveEffects = [...$wildcard].map((effect) => {
    const originInstance = getEffectOrigin(effect, true);
    if(!effect.flags.surge) effect.flags.surge = {};
    effect.flags.surge.originInstance = originInstance;
    return effect
  });
  $: lockCSS = $doc.system.effectActionsLocked ? "lock" : "lock-open";
  $: faLockCSS = $doc.system.effectActionsLocked ? "fa-lock negative" : "fa-lock-open positive";
  $: xpUnspent = parseInt($doc.system.xp?.unspent) || 0;
</script>

<template lang="pug">

.item-sheet.details.overflow
  //- i.fa.fa-circle-check(on:click="{debug}")
  .flexcol.flex3.left
    .flexrow.justify-vertical.my-sm
      .flexcol.flex1.label-container 
        label(for="search") Search
      .flex3.left
        TJSInput({input})

    div
      ol.standard-list
        li.flexrow.header.justify-vertical.standard-list-row
          .li-image
          .flex4.left
            div Name
          .actions.right
            button.stealth.row-action-button.rowimgbezelbutton.pointer(class="{lockCSS}" on:click="{toggleLock}")
              i.fa(class="{faLockCSS}")
        +each("ActiveEffects as effect, index")
          li.flexrow.justify-vertical.standard-list-row
            .li-image(class="{effect.isSuppressed ? 'suspended' : 'active'}")
              img.icon(src="{getAvatarForVersion(effect, window.game.version)}" alt="avatar for game version")
            .flex4.left
              div {effect.name}
            
            .actions.right
              +if("!$doc.system.effectActionsLocked")
                div.hide.row-action-button.rowimgbezelbutton.pointer
                  i.left.fa.fa-edit.mr-md
                button.stealth.row-action-button.rowimgbezelbutton.pointer( on:click="{editItem(index, effect)}")
                  i.left.fa.fa-edit.mr-md
                button.stealth.row-action-button.rowimgbezelbutton.pointer( on:click="{deleteItem(index, effect)}")
                  i.left.fa.fa-trash.mr-md
        li.flexrow.footer

    .flexrow
      .flex1
        button.mt-sm.glossy-button.gold-light.hover-shine(on:click="{openActiveEffectEditor}") + Add Effect
      .flex1
        button.mt-sm.glossy-button.gold-light.hover-shine(on:click="{removeAllEffects}") - Remove All Effects

    h5 Notes: 
    ul.pa-sm.left.pa-md(style="margin-top: -20px")
      li Each of the effects listed are collections. 
      li Click edit next to the collection to see its contents.
      li You should set your item's profile image before adding an effect as the effect will inherit that image. 
    
</template>

<style lang="sass">
  @import '../../../../styles/Mixins.sass'

  .details
    height: calc(100% - 0px)

    +inset
  .actions
    display: flex
    flex-wrap: nowrap
    justify-content: flex-end

</style>
