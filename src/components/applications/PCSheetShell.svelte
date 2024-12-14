<svelte:options accessors={true} />

<script>
  import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";
  import { setContext, getContext, onMount, tick } from "svelte";
  import { getActorOwner, ucfirst } from "~/src/helpers/util";
  import { SYSTEM_ID } from "~/src/helpers/constants";
  import { localize } from "#runtime/svelte/helper";
  import { gameSettings } from '~/src/config/gameSettings';

  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import Abilities from "~/src/components/tabs/actor/PC/Abilities.svelte";
  import Attributes from "~/src/components/tabs/actor/PC/Attributes.svelte";
  import Profile from "~/src/components/tabs/actor/PC/Profile.svelte";
  import Inventory from "~/src/components/tabs/actor/PC/Inventory.svelte";
  import Effects from "~/src/components/organisms/item/shared/EffectsTab.svelte";

  export let elementRoot; //- passed in by SvelteApplication
  export let documentStore; //- passed in by DocumentSheet.js where it attaches DocumentShell to the DOM body
  // export let document; //- passed in by DocumentSheet.js where it attaches DocumentShell to the DOM body

  //- store a copy of the templates for usage as schemas in other places
  setContext("#doc", documentStore);

  const application = getContext("#external").application;
  const applicationWindowHeaderIconsOnly = gameSettings.getStore('applicationWindowHeaderIconsOnly');
  let headerButtonNoLabel = application.reactive.storeAppOptions.headerButtonNoLabel;

  // Tabs
  const defaultTabs = [
    { label: localize("FF15.Tabs.Attributes"), id: "attributes", component: Attributes, img: '/systems/foundryvtt-final-fantasy/assets/icons/tabs/tree.webp' },
    { label: localize("FF15.Tabs.Abilities"), id: "abilities", component: Abilities, img: '/systems/foundryvtt-final-fantasy/assets/icons/tabs/sun.webp' },
    { label: localize("FF15.Tabs.Inventory"), id: "inventory", component: Inventory, img: '/systems/foundryvtt-final-fantasy/assets/icons/tabs/backpack.webp'},
    { label: localize("FF15.Tabs.Profile"), id: "profile", component: Profile, img: '/systems/foundryvtt-final-fantasy/assets/icons/tabs/mask.webp' },
    { label: localize("FF15.Tabs.Effects"), id: "effect", component: Effects, img: '/systems/foundryvtt-final-fantasy/assets/icons/tabs/spiral.webp' }
  ];

  // set the sheet color
  let stylesApp;
  let activeTab = "attributes";
  let _filePickerInstance = {};


  // below is just for reference on creating active effects. This is handled in ActorSheet.js
  async function handleDrop(event) {
    return;

    if (type === "Item") {
      droppedItem = await game.items.get(split[1]);
    } else if (type === "Compendium") {
      const compendiumName = `${split[1]}.${split[2]}`;
      const pack = game.packs.get(compendiumName);
      droppedItem = await pack.getDocument(split[3]);
    }

    if (droppedItem.type == "effect") {
      //- get the effects from the item
      //- add the effect from the item to this item
      await $documentStore.createEmbeddedDocuments("ActiveEffect", Array.from(droppedItem.effects));
    }
  }

  $: tabs = defaultTabs;
  // Use reactive statements to properly update the headerButtonNoLabel
  $: $headerButtonNoLabel = $applicationWindowHeaderIconsOnly;

  // Debugging the reactive flow

  onMount(async () => {
    game.system.log.d($documentStore)
  });
</script>

<template lang="pug">
  ApplicationShell(bind:elementRoot bind:stylesApp)
    //- @why NB: do not remove this next element; it doesn't have to be `pre` can be any element, but without it the button animations defined in styles below will not work. I don't know why. It's magic.
    Tabs.tabs.tall(tabs="{tabs}" activeTab="{activeTab}")
</template>

<style lang="sass">
:global(.edit-sheet)
  color: var(--ff-border-color)
  display: flex
  align-items: center
:global(.edit-sheet i)
  font-size: larger
:global(.edit-sheet.active)
  color: var(--border-highlight)
  animation: pulse 1.2s infinite ease-out
  
@keyframes pulse
  0%
    opacity: 1
  25%
    opacity: 0.5
  100%
    opacity: 1

</style>
