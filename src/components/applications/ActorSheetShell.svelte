<svelte:options accessors={true} />

<script>
  import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";
  import { setContext, getContext, onMount, tick } from "svelte";
  import { getActorOwner, ucfirst } from "~/src/helpers/utility";
  import { SYSTEM_ID } from "~/src/helpers/constants";
  import { localize } from "#runtime/svelte/helper";

  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import Abilities from "~/src/components/pages/actor/Abilities.svelte";
  import Attributes from "~/src/components/pages/actor/Attributes.svelte";
  import Profile from "~/src/components/pages/actor/Profile.svelte";
  import Inventory from "~/src/components/pages/actor/Inventory.svelte";

  export let elementRoot; //- passed in by SvelteApplication
  export let documentStore; //- passed in by DocumentSheet.js where it attaches DocumentShell to the DOM body
  // export let document; //- passed in by DocumentSheet.js where it attaches DocumentShell to the DOM body

  //- store a copy of the templates for usage as schemas in other places
  setContext("#doc", documentStore);

  const application = getContext("#external").application;
  const headerButtonNoLabel = application.reactive.storeAppOptions.headerButtonNoLabel;


  const setHeaderLabels = (value) => {
    $headerButtonNoLabel = value;
  };

  $: if (game.settings.get(SYSTEM_ID, "applicationWindowHeaderIconsOnly") == true) {
    $headerButtonNoLabel = true;
  } else {
    $headerButtonNoLabel = false
  }

  // set the sheet color
  let stylesApp;
  let _filePickerInstance = {};
  let activeTab = "attributes";

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

  // Tabs
  const defaultTabs = [
    { label: localize("FF15.Tabs.Attributes"), id: "attributes", component: Attributes },
    { label: localize("FF15.Tabs.Abilities"), id: "abilities", component: Abilities },
    { label: localize("FF15.Tabs.Inventory"), id: "inventory", component: Inventory },
    { label: localize("FF15.Tabs.Profile"), id: "profile", component: Profile },
    // { label: "Abilities", id: "abilities", component: Abilities },
    // { label: "Journal", id: "journal", component: Journal },
  ];
  // const pathsTab = { label: "Paths", id: "paths", component: Paths };

  // setContext("#templates", templates);

  // below is just for reference on creating active effects. This is handled natively in DocumentSheet.js
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

  // $: tabs = hasPaths ? [...defaultTabs.slice(0, 3), pathsTab, ...defaultTabs.slice(3)] : defaultTabs;

  $: tabs = defaultTabs;

  onMount(async () => {

  });
</script>

<template lang="pug">
  ApplicationShell(bind:elementRoot bind:stylesApp)
    pre {game.settings.get(SYSTEM_ID, "applicationWindowHeaderIconsOnly")}
    Tabs(tabs="{tabs}" activeTab="{activeTab}")
</template>

<style lang="sass">

</style>
