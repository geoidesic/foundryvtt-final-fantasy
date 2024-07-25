<svelte:options accessors={true} />

<script>
  import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";
  import { setContext, getContext, onMount } from "svelte";
  import { getActorOwner, ucfirst } from "~/src/helpers/utility";
  import { localize } from "#runtime/svelte/helper";

  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import Attributes from "~/src/components/pages/actor/Attributes.svelte";
  import Profile from "~/src/components/pages/actor/Profile.svelte";


  export let elementRoot; //- passed in by SvelteApplication
  export let documentStore; //- passed in by DocumentSheet.js where it attaches DocumentShell to the DOM body
  export let document; //- passed in by DocumentSheet.js where it attaches DocumentShell to the DOM body

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

  const application = getContext("#external").application;
  // console.log(application);

  let activeTab =  "attributes";


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
    { label: localize("FF15.Tabs.Profile"), id: "profile", component: Profile },
    // { label: "Abilities", id: "abilities", component: Abilities },
    // { label: "Journal", id: "journal", component: Journal },
  ];
  // const pathsTab = { label: "Paths", id: "paths", component: Paths };

  // $: tabs = hasPaths ? [...defaultTabs.slice(0, 3), pathsTab, ...defaultTabs.slice(3)] : defaultTabs;

  $: tabs = defaultTabs;

  // set the sheet color
  let stylesApp;


  //- store a copy of the templates for usage as schemas in other places
  setContext("#doc", documentStore);
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

  onMount(() => {
    log.d($documentStore)
   
  });
</script>

<template lang="pug">
  ApplicationShell(bind:elementRoot bind:stylesApp)
    Tabs(tabs="{tabs}" activeTab="{activeTab}")
</template>

<style lang="sass">

</style>
