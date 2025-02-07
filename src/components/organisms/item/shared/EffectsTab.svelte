<svelte:options accessors={true} />

<script>
  import { getContext, setContext, onMount, onDestroy } from "svelte";
  import { rippleFocus } from "#standard/action/animate/composable";
  import { TJSInput } from "#standard/component/form";
  import { createFilterQuery } from "~/src/filters/itemFilterQuery";
  import { TJSDocument } from "#runtime/svelte/store/fvtt/document";

  import { getEffectOrigin } from "~/src/helpers/util";
  import { SYSTEM_ID } from "~/src/helpers/constants";
  import { localize, isParentActor } from "~/src/helpers/util";
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

  //- @why: some fields are only available on actor sheets
  $: parentIsActor = isParentActor($doc) || (sheet && sheet.includes('actor'));
  // Determine if this is an actor sheet
  $: isActorSheet = sheet === 'actor';
  // Check if user is GM
  $: isGM = game.user.isGM;
  // Show delete buttons only if GM or not an actor sheet
  $: showDelete = !isActorSheet || isGM;
  // Show add/remove all buttons only if GM or not an actor sheet
  $: showAddRemoveButtons = !isActorSheet || isGM;

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
        item.isTransferred
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
        renderSheet:true,
        flags: {
          [SYSTEM_ID]: {},
        },
      },
      { parent: $doc },
    );

    game.system.log.d("effect", effect);

    //- @deprecated, this opens the Foundry sheet instead of the custom sheet
    // const effectConfig = new ActiveEffectConfig(effect, { editable: true });
    // effectConfig.render(true);
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
.panel.overflow.containerx
  .padded
    h1.gold {localize('Effects')}
    table.borderless.even
      tr.gold
        th.img.shrink(scope="col")
        th.left.expand.ml-sm(scope="col") {localize('Name')}
        +if("parentIsActor")
          th.left.shrink(scope="col") {localize('Origin')}
        th.buttons(scope="col" class="{lockCSS}")
          button.stealth(class="{lockCSS}" on:click="{toggleLock}")
            i.fa(class="{faLockCSS}")
      +each("ActiveEffects as effect, index")
        tr(class="{effect.disabled ? 'disabled' : ''}")
          td.img
            img.icon(
              class="{effect.isSuppressed ? 'suspended' : 'active'}" 
              src="{getAvatarForVersion(effect, window.game.version)}" 
              alt="avatar for game version"
            )
          td.left.expand.no-wrap {effect.name}
          +if("parentIsActor")
            td.img.left
              +if("effect.getFlag(SYSTEM_ID, 'transferredBy.actor.img')")
                img.icon.nopointer(
                  src="{effect.getFlag(SYSTEM_ID, 'transferredBy.actor.img')}" 
                  alt="avatar for effect origin"
                  data-tooltip="{effect.getFlag(SYSTEM_ID, 'transferredBy.actor.name')}"
                  data-tooltip-class="FF15-tooltip"
                )
                +else
                  span.no-wrap {localize('Unknown')}
          td.buttons.right.no-wrap
            +if("!$doc.system.effectActionsLocked && showDelete")
              button.stealth(on:click="{editItem(index, effect)}")
                i.left.fa.fa-edit
              button.stealth(on:click="{deleteItem(index, effect)}")
                i.left.fa.fa-trash

    +if("showAddRemoveButtons")
      .flexrow.mt-sm(style="justify-content: space-evenly")
        button.glossy-button.gold-light.hover-shine.no-wrap(on:click="{openActiveEffectEditor}") + Add Effect
        button.glossy-button.gold-light.hover-shine.no-wrap(on:click="{removeAllEffects}") - Remove All Effects
</template>

<style lang="sass">
  @use '../../../../styles/_mixins' as mixins

  .disabled
    opacity: 0.5
</style>
