<script>
  import { getContext, onMount } from "svelte";
  import { rippleFocus } from "@typhonjs-fvtt/runtime/svelte/action/animate";
  import { TJSDocument } from "@typhonjs-fvtt/runtime/svelte/store/fvtt/document";
  import { TJSInput } from "@typhonjs-fvtt/svelte-standard/component";
  import { createFilterQuery } from "~/src/filters/inventoryFilterQuery";
  import { toggleBookmark } from "~/src/helpers/util";
  import { SYSTEM_ID, SYSTEM_CODE } from "~/src/helpers/constants";
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
    let okToDelete = true;
    if(game.settings.get(SYSTEM_ID, 'confirmBeforeDeletingActorItem')) {
      okToDelete = confirm(
        game.i18n.localize(`${SYSTEM_CODE}.Types.Actor.Inventory.confirmDeleteItem`)
      );
    }
    if(okToDelete) {
      item.delete();
    }
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
    .flexrow.inventory-search-bar.pt-sm.pr-sm.justify-flexrow-vertical()
      .flexcol.flex1.label-container 
        label Search
      .flex3.left
        TJSInput({input} role="searchbox") 
      
    div.px-smd.mt-sm.inventory-rows-container
      ol
        InventoryRow.header(lockCss="{lockCSS}" toggleLock="{toggleLock}" role="rowheader")
          div.li-image.header(slot="c1") 
            div.flex0
              div.relative.buttons
                div.rowimg.button
                  
          div(slot="c2") 
            div Name
          div(slot="c3")
            div Quantity
          div(slot="c4")
            div
              i.fa-solid.fa-bookmark
          div.actions(slot="c5") 
            div.hide.rowbutton.rowimgbezelbutton
              i.left.fa.fa-edit.mr-md
            div.hide.rowbutton.rowimgbezelbutton
              i.left.fa.fa-copy.mr-md
            div.rowbutton.rowimgbezelbutton(class="{lockCSS}" style="cursor: pointer; min-width: 2.7rem" on:click|preventDefault!="{toggleLock}")
              i.fa(class="{faLockCSS}")
        +each("items as item, index")
          InventoryRow(lockCss="{lockCSS}" index="{index}" toggleLock="{toggleLock}" role="row")
            div.li-image(slot="c1")
              img.icon(src="{item.img}" )
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
  border: 1px inset grey
  border-radius: var(--border-radius)


:global(.FF15 li.inventory-row.header)
  padding: 0.4rem 0.3rem

:global(.FF15 li.inventory-row)
  position: relative // Allows the img to be positioned properly
  padding: 0 0.3rem
  margin: 0 2px 2px 2px
  align-items: center
  border-radius: var(--border-radius)
  display: flex
  flex-direction: row
  justify-content: flex-start
  background: rgba(0, 0, 0, 0.1)
  max-height: 2rem
  .li-image
    display: flex
    align-items: center
    flex-shrink: 0
    margin-left: -0.3rem
    max-height: 2rem
    flex: 0.7
    img.icon
      max-height: 2rem
      border-top-left-radius: var(--border-radius)
      border-bottom-left-radius: var(--border-radius)
      border-top-right-radius: 0px
      border-bottom-right-radius: 0px
      
input
  background-color: white
  height: 1.2rem

.label-container
  justify-content: center

.actions
  display: flex
  flex-wrap: nowrap
  justify-content: flex-end
</style>