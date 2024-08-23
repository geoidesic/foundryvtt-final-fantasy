<script>
  import { getContext, onMount } from "svelte";
  import { rippleFocus } from "@typhonjs-fvtt/runtime/svelte/action/animate";
  import { TJSDocument } from "@typhonjs-fvtt/runtime/svelte/store/fvtt/document";
  import { TJSInput } from "@typhonjs-fvtt/svelte-standard/component";
  import { createFilterQuery } from "~/src/filters/inventoryFilterQuery";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import ScrollingContainer from "~/src/helpers/svelte-components/ScrollingContainer.svelte";
  import InventoryRow from "./InventoryRow.svelte";


  const Actor = getContext("#doc");
  const doc = new TJSDocument($Actor);

  function editItem(item) {
    game.system.log.d('editItem')
    game.system.log.d(item)
  }

  function addQuantity(item) {
    game.system.log.d('addQuantity')
    game.system.log.d(item)
  }


  function duplicateItem(item) {
    game.system.log.d('duplicateItem')
    game.system.log.d(item)
  }


  function deleteItem(item) {
      game.system.log.d('deleteItem')
      game.system.log.d(item)
  }

  function roll(item) {
      game.system.log.d('roll')
      game.system.log.d(item)
  }

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
                  +if("rollableCharacteristics.includes(item.type)")
                    div.rowimg.button.rowimgbezelbutton(on:click!="{roll(item)}")
                      img.left.flex0(src="{item.img}" )
                    +else()
                      div.rowimg
                        img.left.flex0(src="{item.img}" )
            div(slot="c2") 
              div.pointer.link(on:click="{showItemSheet(item)}" class="{item.system.isMagic ? 'pulse' : ''}") {item.name}
            div(slot="c3") 
              .clickable(data-tooltip="Left click + / Right Click -" on:click!="{addQuantity(item)}" on:contextmenu!="{removeQuantity(item)}") {item.system.quantity}
            div(slot="c4") 
              i.fa-bookmark.row(class="{item.system.bookmarked === true ? 'fa-solid' : 'fa-regular'}" on:click="{toggleBookmark(item)}")
            div.buttons.actions(slot="c5")
              +if("!$doc.system.inventoryLocked")
                div.rowbutton.rowimgbezelbutton
                  i.left.fa.fa-edit.mr-md( on:click="{editItem(index, item)}")
                div.rowbutton.rowimgbezelbutton
                  i.left.fa.fa-copy.mr-md( on:click="{duplicateItem(index, item)}")
                div.rowbutton.rowimgbezelbutton
                  i.left.fa.fa-trash.mr-md( on:click="{deleteItem(index, item)}")
</template>
<style lang='sass'>
  @import '../../../styles/Mixins.sass'
  .background
    text-align: left
    min-height: 100%
    width: 100%
    position: relative
    overflow: hidden
    border: 4px ridge var(--border-color)
</style>