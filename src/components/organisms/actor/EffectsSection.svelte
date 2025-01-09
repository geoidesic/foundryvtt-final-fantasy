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
.effects&attributes($$restProps)
  +if("ActiveEffects.length > 0")
    h2.font-cinzel {localize('FF15.Effects')}
    .px-xs
      table.borderless.low-contrast
        +each("ActiveEffects as item, index")
          tr
            th.img.shrink(scope="col")
              img.icon(src="{item.img}" alt="{item.name}")
            td.left
              a.ml-sm.stealth.link.no-wrap(
                role="button"
                on:click!="{() => openItem(index, item)}"
                on:keydown!="{(e) => e.key === 'Enter' && openItem(index, item)}"
                tabindex="0"
              ) {localize(item.name)}
  +if("!ActiveEffects.length")
    p(style="margin-top: -2px; margin-bottom: 0px;") {localize("FF15.NoEffects")}
</template>

<style lang="sass">
@use '../../../styles/_mixins' as mixins

.effects
  margin-top: 1em
  padding: 1em
  width: 100%
</style>
