<script>
  import { getContext, onMount } from "svelte";
  import { rippleFocus } from "#standard/action/animate/composable";
  import { TJSDocument } from "#runtime/svelte/store/fvtt/document";

  import { TJSInput } from "#standard/component/form";
  import { createFilterQuery } from "~/src/filters/itemFilterQuery";
  import { toggleBookmark, ucfirst } from "~/src/helpers/util";
  import { localize } from "~/src/helpers/util";
  import { SYSTEM_ID, SYSTEM_CODE } from "~/src/helpers/constants";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import ScrollingContainer from "~/src/helpers/svelte-components/ScrollingContainer.svelte";
  import InventoryRow from "~/src/components/molecules/InventoryRow.svelte";

  const Actor = getContext("#doc");
  const doc = new TJSDocument($Actor);
  const typeSearch = createFilterQuery("type");
  typeSearch.set(['equipment']); // Updated to filter for both types
  const input = {
    store: typeSearch,
    efx: rippleFocus(),
    placeholder: "by Name",
    type: "search",
    id: "search",
  };

  /** @type {import('@typhonjs-fvtt/runtime/svelte/store').DynMapReducer<string, Item>} */
  const wildcard = doc.embedded.create(Item, {
    name: "wildcard",
    filters: [typeSearch],
    sort: (a, b) => a.name.localeCompare(b.name),
  });

  function editItem(item) {
    item.sheet.render(true);

    game.system.log.d("editItem");
    game.system.log.d(item);
  }

  function addQuantity(item) {
    game.system.log.d("addQuantity");
    game.system.log.d(item);

    const quantity = item.system.quantity + 1;
    item.update({ system: { quantity: quantity } });
  }

  function removeQuantity(item) {
    const quantity = item.system.quantity - 1;
    item.update({ system: { quantity: quantity } });
  }

  function duplicateItem(item) {
    game.system.log.d("duplicateItem");
    game.system.log.d(item);
    const itemData = item.toObject();
    delete itemData._id;
    game.system.log.d("itemData", itemData);
    $Actor.sheet._onDropItemCreate(itemData);
  }

  async function removeAllItems() {
    const okToDelete = confirm(localize("Types.Actor.Inventory.confirmDeleteAll"));
    if (okToDelete) {
      await $Actor.deleteAllItems('equipment');
    }
  }

  function deleteItem(index, item) {
    let okToDelete = true;
    if (game.settings.get(SYSTEM_ID, "confirmBeforeDeletingActorItem")) {
      okToDelete = confirm(localize("Types.Actor.Inventory.confirmDeleteItem"));
    }
    if (okToDelete) {
      item.delete();
    }
  }

  function roll(item) {
    game.system.log.d("roll");
    game.system.log.d(item);
  }

  function useItem(item) {
    const result = new CONFIG.FFXIV.RollCalcActor({ actor: $Actor }).equipment(item);
  }
  
  function toggleLock(event) {
    game.system.log.d("a");
    event.stopPropagation();
    event.preventDefault();
    $doc.update(
      {
        ["system.inventoryLocked"]: !$doc.system.inventoryLocked,
      },
      {
        diff: true,
        diffData: true,
        diffSystem: true,
      },
    );
  }

  function showItemSheet(item) {
    item.sheet.render(true);
  }

  onMount(async () => {});

  $: items = [...$wildcard];
  $: lockCSS = $doc.system.inventoryLocked ? "lock" : "lock-open";
  $: faLockCSS = $doc.system.inventoryLocked ? "fa-lock negative" : "fa-lock-open positive";
</script>

<template lang="pug">

    //- .flexrow.pt-sm.pr-sm
    //-   .flexcol.flex1.label-container 
    //-     label Search
    //-   .flex3.left
    //-     TJSInput({input})
    //-   .flexcol.flex1.label-container 
    //-     label Type
    //-   .flex3.right
    //-     Select.short(options="{typeFilterOptions}" bind:value="{typeFilterValue}")

    .panel.overflow.containerx
      .padded
        h1.gold {localize('Inventory')}
        table.borderless
          tr.gold
            th.img.shrink(scope="col")
            th.left.expand(scope="col") {localize('Name')}
            th.fixed(scope="col") {localize('Quantity')}
            th.shrink(scope="col")
              i.fa-solid.fa-bookmark
            th(scope="col" class="{lockCSS}")
              button.stealth(class="{lockCSS}" on:click="{toggleLock}")
                i.fa(class="{faLockCSS}" )
          +each("items as item, index")
            //- pre item.type {item.type}
            tr
              td.img(data-tooltip="{localize('Use')}" on:click="{useItem(item)}" role="button")
                img.icon(src="{item.img}" alt="{item.name}" )
              td.left(data-tooltip="{localize('View')}")
                a.stealth.link(on:click="{showItemSheet(item)}" class="{item.system.isMagic ? 'pulse' : ''}" role="button") {item.name}
              td 
                button.stealth.clickable.wide(data-tooltip="Left click + / Right Click -" on:click!="{addQuantity(item)}" on:contextmenu!="{removeQuantity(item)}") {item.system.quantity}
              td( data-tooltip="{localize('Bookmark')}")
                button.stealth(on:click="{toggleBookmark(item)}") 
                  i.fa-bookmark(class="{item.system.favourite === true ? 'fa-solid' : 'fa-regular'}")
              td.min.buttons.right.white
                +if("!$doc.system.inventoryLocked")
                  button.stealth( data-tooltip="{localize('Types.Actor.ActionButtons.Edit')}" on:click="{editItem(item)}")
                    i.left.fa.fa-edit
                  button.stealth( data-tooltip="{localize('Types.Actor.ActionButtons.Duplicate')}" on:click="{duplicateItem(index, item)}")
                    i.left.fa.fa-copy
                  button.stealth( data-tooltip="{localize('Types.Actor.ActionButtons.Delete')}" on:click="{deleteItem(index, item)}")
                    i.left.fa.fa-trash
            
      button.mt-sm.glossy-button.gold-light.hover-shine(on:click="{removeAllItems}") {localize("Instructions.RemoveAll")}
            
</template>

<style lang="sass">
@use '../../../../styles/_mixins' as mixins

.containerx
  container-type: inline-size

.padded
  transition: padding 0.2s ease-in-out
  @container (min-width: 350px)
    padding: 1rem
.pulse
  +mixins.pulse

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


</style>
