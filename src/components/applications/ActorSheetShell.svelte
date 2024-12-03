<svelte:options accessors={true} />

<script>
  import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";
  import { setContext, getContext, onMount, tick } from "svelte";
  import { getActorOwner, ucfirst } from "~/src/helpers/util";
  import { SYSTEM_ID } from "~/src/helpers/constants";
  import { localize } from "#runtime/svelte/helper";
  import { gameSettings } from '~/src/config/gameSettings';

  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import Abilities from "~/src/components/tabs/actor/Abilities.svelte";
  import Attributes from "~/src/components/tabs/actor/Attributes.svelte";
  import Profile from "~/src/components/tabs/actor/Profile.svelte";
  import Inventory from "~/src/components/tabs/actor/Inventory.svelte";

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
    { label: localize("FF15.Tabs.Attributes"), id: "attributes", component: Attributes },
    { label: localize("FF15.Tabs.Abilities"), id: "abilities", component: Abilities },
    { label: localize("FF15.Tabs.Inventory"), id: "inventory", component: Inventory },
    { label: localize("FF15.Tabs.Profile"), id: "profile", component: Profile },
  ];

  // set the sheet color
  let stylesApp;
  let activeTab = "attributes";
  let _filePickerInstance = {};

  function _launchStandardProfileEditor(event) {
    const current = $documentStore.img;
    if (_filePickerInstance instanceof FilePicker && !_filePickerInstance?.rendered) {
      _filePickerInstance.render(true);
      return;
    }
    _filePickerInstance = new FilePicker({
      type: "image",
      current: current,
      callback: (path) => {
        $documentStore.update({ img: path });
      },

      top: application.position.top + 40,
      left: application.position.left + 10,
    });
    return _filePickerInstance.browse();
  }

  //- provide Tokenizer support
  function _editToken(event) {
    if (game.modules.has("vtta-tokenizer") && typeof Tokenizer !== "undefined") {
      _launchTokenizer();
    } else {
      _launchStandardProfileEditor(event);
    }
  }

  function _launchTokenizer() {
    if (game.modules.has("vtta-tokenizer") && typeof Tokenizer !== "undefined") {
      Tokenizer.tokenizeActor($documentStore);
    }
  }

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
  $: console.log('headerButtonNoLabel:', headerButtonNoLabel);
  $: console.log('applicationWindowHeaderIconsOnly:', $applicationWindowHeaderIconsOnly);

  onMount(async () => {

  });
</script>

<template lang="pug">
  ApplicationShell(bind:elementRoot bind:stylesApp)
    //- @why NB: do not remove this next element; it doesn't have to be `pre` can be any element, but without it the button animations defined in styles below will not work. I don't know why. It's magic.
    Tabs(tabs="{tabs}" activeTab="{activeTab}")
</template>

<style lang="sass">
:global(.edit-sheet)
  color: var(--border-color)
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
