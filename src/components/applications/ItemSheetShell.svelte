<svelte:options accessors={true} />

<script>
  import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";
  import { setContext, getContext, onMount } from "svelte";
  import { ucfirst } from "~/src/helpers/util.js";
  import ItemInput from "~/src/components/atoms/item/ItemInput.svelte";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
  import * as components from "~/src/components/organisms/item/type";

  export let elementRoot; //- passed in by SvelteApplication
  export let documentStore; //- passed in by DocumentSheet.js where it attaches DocumentShell to the DOM body
  // export let document; //- passed in by DocumentSheet.js where it attaches DocumentShell to the DOM body

  const headerMap = {
    action: components.ActionHeader,
    equipment: components.EquipmentHeader,
    job: components.JobHeader,
    trait: components.TraitHeader,
    limitbreak: components.LimitbreakHeader
  }
  const tabMap = {
    action: components.ActionTabs,
    equipment: components.EquipmentTabs,
    job: components.JobTabs,
    trait: components.TraitTabs,
    limitbreak: components.LimitbreakTabs
  }

  const application = getContext("#external").application;
  let activeTab = "description";

  setContext("#doc", documentStore);

  $: item = $documentStore;

  //- Profile Editor
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
    _launchStandardProfileEditor(event);
  }

  async function handleDrop(event) {
    const data = JSON.parse(event.dataTransfer.getData("text/plain"));

    let droppedItem;
    let split = data.uuid.split(".");
    let type = split[0];

    if (type === "Item") {
      console.log("handleDrop 1");

      droppedItem = await game.items.get(split[1]);
    } else if (type === "Compendium") {
      console.log("handleDrop 2");
      const compendiumName = `${split[1]}.${split[2]}`;
      const pack = game.packs.get(compendiumName);
      droppedItem = await pack.getDocument(split[4]);
    }

    if (droppedItem.type == "effect") {
      console.log("handleDrop 3");
      console.log(">>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<");
      console.log(droppedItem.effects);
      const effects = Array.from(droppedItem.effects);
      console.log("effects", effects);

      //- get the effects from the item
      //- add the effect from the item to this item
      await $documentStore?.createEmbeddedDocuments("ActiveEffect", effects);
      console.log("$documentStore", $documentStore);
    }
  }

  onMount(() => {
    game.system.log.d("ItemSheetShell mounted", $documentStore);
  });
</script>

<template lang="pug">
  ApplicationShell(bind:elementRoot)
    .flexrow.gap-15.wide
      .flex1.profile-wrap
        .flex0
          button.stealth.profile(on:click="{_launchStandardProfileEditor}")
            img.profile(src="{$documentStore?.img}" data-tooltip="{$documentStore?.name}" alt="{$documentStore?.name}" )
          
        .flexcol
          table(style="text-align: center")
            tr
              td
                div {game.i18n.localize(`TYPES.Item.${item.type}`)} 
          svelte:component(this="{headerMap[item.type]}")
        
      .flex4.wide.mr-sm
        header.wide
          .left.wide
            DocInput.wide.widebutton.left(id="name" valuePath="name" placeholder="Item Name" maxlength="40" textClasses="wide bold burgundy")
        section.mt-sm
                
                
          svelte:component(this="{tabMap[item.type]}" bind:activeTab="{activeTab}")

    //- header
    //-   .flexrow.gap-15
    //-     .profile-wrap.flex0
    //-       button.stealth.profile(on:click="{_launchStandardProfileEditor}")
    //-         img.profile(src="{$documentStore?.img}" data-tooltip="{$documentStore?.name}" alt="{$documentStore?.name}" )
          
    //-     .flex1.left
    //-       //- ItemInput(className="lg transparent" id="name" attr="name" label="Name" placeholder="Item Name" maxlength="40")
    //-       DocInput.wide.left(id="name" valuePath="name" placeholder="Item Name" maxlength="40" textClasses="wide")
    //- section.mt-sm

</template>

<style lang='sass'>
  @import '../../styles/Mixins.sass'

  :global(.FF15.window-app .window-content)
    display: block

  .profile-wrap
    min-width: 50px
    max-width: 150px
    /* position: relative */

  // .portrait img
  //   display: block
  //   width: 100%
  //   height: 100%
  //   -o-object-fit: cover
  //   object-fit: cover
  //   -o-object-position: top
  //   object-position: top
  .tabs
    height: 100%
  img
    border: none
    min-width: 50px

</style>
