<svelte:options accessors={true} />

<script>
  import { getContext, setContext, onMount, onDestroy } from "svelte";
  import { rippleFocus } from "@typhonjs-fvtt/runtime/svelte/action/animate";
  import { TJSInput } from "@typhonjs-fvtt/svelte-standard/component";
  import { createFilterQuery } from "~/src/filters/itemFilterQuery";
  import { TJSDocument } from "@typhonjs-fvtt/runtime/svelte/store/fvtt/document";
  import { localize } from "#runtime/svelte/helper";
  import { SYSTEM_CODE } from "~/src/helpers/constants";
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

  });
  onDestroy(() => {
    Hooks.off('createActiveEffect', resetEffectList);
    Hooks.off('deleteActiveEffect', resetEffectList);

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
 .favourites({...$$restProps})
    h2.font-cinzel Effects
    div.pa-xs
      +if("ActiveEffects.length > 0")
        table.borderless
          tr
            th.img.shrink(scope="col")
          th.left.expand(scope="col") {localize(`${SYSTEM_CODE}.Name`)}
          th.fixed(scope="col") 
            
        +each("ActiveEffects as item, index")
          //- pre item.type {item.type}
          tr
            td.img
              img.icon(src="{item.img}" alt="{item.name}")
            td.left
              a.ml-sm.stealth.link(on:click="{editItem(index, item)}") {item.name}
            td
        +else
          p(style="margin-top: -10px; margin-bottom: 0px;") {localize("FF15.NoEffects")}

</template>

<style lang="sass">
  @import '../../../styles/Mixins.sass'

  .actions
    display: flex
    flex-wrap: nowrap
    justify-content: flex-end

</style>
