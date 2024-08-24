<script>
  import { getContext, onMount } from "svelte";
  import { rippleFocus } from "@typhonjs-fvtt/runtime/svelte/action/animate";
  import { TJSDocument } from "@typhonjs-fvtt/runtime/svelte/store/fvtt/document";
  import { TJSInput } from "@typhonjs-fvtt/svelte-standard/component";
  import { createFilterQuery } from "~/src/filters/inventoryFilterQuery";
  import { toggleBookmark } from "~/src/helpers/util";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import ScrollingContainer from "~/src/helpers/svelte-components/ScrollingContainer.svelte";
  import InventoryRow from "./InventoryRow.svelte";

  const Actor = getContext("#doc");
  const doc = new TJSDocument($Actor);
  const nameSearch = createFilterQuery("name");
  const input = {
    store: nameSearch,
    efx: rippleFocus(),
    placeholder: "by Name",
    type: "search",
  };

  /** @type {import('@typhonjs-fvtt/runtime/svelte/store').DynMapReducer<string, Item>} */
  const wildcard = doc.embedded.create(Item, {
    name: "wildcard",
    filters: [nameSearch],
    sort: (a, b) => a.name.localeCompare(b.name),
  });


  function addItem(item) {
    game.system.log.d('addItem')
    game.system.log.d(item)
  }
  function editItem(item) {
    game.system.log.d('editItem')
    game.system.log.d(item)
  }

  function addQuantity(item) {
    game.system.log.d('addQuantity')
    game.system.log.d(item)

    const quantity = item.system.quantity + 1;
    item.update({ system: { quantity: quantity } });
  }

  function removeQuantity(item) {
    const quantity = item.system.quantity - 1;
    item.update({ system: { quantity: quantity } });
  }

  function duplicateItem(item) {
    game.system.log.d('duplicateItem')
    game.system.log.d(item)
    const itemData = item.toObject();
    delete itemData._id;
    game.system.log.d('itemData', itemData);
    $Actor.sheet._onDropItemCreate(itemData)
  }

  function deleteItem(index, item) {
    item.delete();
  }

  function roll(item) {
      game.system.log.d('roll')
      game.system.log.d(item)
  }
  function toggleLock(event) {
    game.system.log.d('a')
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
      }
    );
  }

  function showItemSheet(item) {
    item.sheet.render(true);
  }

  onMount(async () => {

  })

  $: items = [...$wildcard];
  $: lockCSS = $doc.system.inventoryLocked ? "lock" : "lock-open";
  $: faLockCSS = $doc.system.inventoryLocked ? "fa-lock negative" : "fa-lock-open positive";

</script>
<template lang='pug'>

  ScrollingContainer
    .flexrow.pt-sm.pr-sm
      .flexcol.flex1.label-container 
        label Search
      .flex3.left
        TJSInput({input}) 
      
    div.pa-sm
      ol
        InventoryRow.header(lockCss="{lockCSS}" toggleLock="{toggleLock}")
          div(slot="c1") 
            i.left.fa.fa-add.mr-md( on:click="{addItem}")

          div(slot="c2") 
            div Name
          div(slot="c3")
            div Quantity
          div(slot="c4")
            div
              i.fa-solid.fa-bookmark
          div(slot="c5") 
            div.rowbutton.rowimgbezelbutton(class="{lockCSS}" style="cursor: pointer" on:click|preventDefault!="{toggleLock}")
              i.fa(class="{faLockCSS}")
        +each("items as item, index")
          InventoryRow.relative(lockCss="{lockCSS}" index="{index}" toggleLock="{toggleLock}")
            div(slot="c1")
              div.flex0
                div.relative.buttons
                  div.rowimg.button(on:click!="{roll(item)}")
                    img.left.flex0(src="{item.img}" )
            div(slot="c2") 
              div.pointer.link(on:click="{showItemSheet(item)}" class="{item.system.isMagic ? 'pulse' : ''}") {item.name}
            div(slot="c3") 
              .clickable(data-tooltip="Left click + / Right Click -" on:click!="{addQuantity(item)}" on:contextmenu!="{removeQuantity(item)}") {item.system.quantity}
            div(slot="c4") 
              i.fa-bookmark.row.pointer(class="{item.system.favourite === true ? 'fa-solid' : 'fa-regular'}" on:click="{toggleBookmark(item)}")
            div.buttons.actions(slot="c5")
              +if("!$doc.system.inventoryLocked")
                div.rowbutton.rowimgbezelbutton( on:click="{editItem(index, item)}")
                  i.left.fa.fa-edit.mr-md
                div.rowbutton.rowimgbezelbutton( on:click="{duplicateItem(index, item)}")
                  i.left.fa.fa-copy.mr-md
                div.rowbutton.rowimgbezelbutton( on:click="{deleteItem(index, item)}")
                  i.left.fa.fa-trash.mr-md
</template>
<style lang='sass'>
@import '../../../styles/Mixins.sass'

.pulse
  @include pulse

.buttons
  @include buttons

.fa.fa-add
  cursor: pointer
  &:hover
    background-color: var(--sheet-color)
    color: var(--sheet-contrast)

.clickable
  max-height: 1.3rem
  line-height: 1.3rem
  display: flex
  justify-content: center
  align-items: center
  background: rgba(255, 255, 255, 0.2)
  cursor: pointer

img
  border: none
  width: 20px
  height: 20px

.inverted
  transform: scalex(-1)

i
  padding: 0
  margin: 0

.full
  color: var(--color-negative)

ol
  height: 100%
  margin: 0
  padding: 0.1rem
  border: 1px solid grey
  border-radius: var(--border-radius)

  li,
  :global(li)
    padding: 3px
    margin: 0 2px 2px 2px
    align-items: center
    &:not(.header):not(.footer)
      background-color: #cdc8c7

    &.header
      padding: 0 3px
      line-height: 1rem
      text-align: top
      justify-content: top
      border-bottom-left-radius: 0
      border-bottom-right-radius: 0
      margin-bottom: 0
      border-bottom: none

input
  background-color: white
  height: 1.2rem

.label-container
  justify-content: center

</style>