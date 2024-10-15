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
  import InventoryRow from "~/src/components/molecules/InventoryRow.svelte";
  import RollCalcActor from "~/src/helpers/RollCalcActor"

  const Actor = getContext("#doc");
  const doc = new TJSDocument($Actor);
  const nameSearch = createFilterQuery("name");
  const input = {
    store: nameSearch,
    efx: rippleFocus(),
    placeholder: "by Name",
    type: "search",
    id: "search"
  };

  /** @type {import('@typhonjs-fvtt/runtime/svelte/store').DynMapReducer<string, Item>} */
  const wildcard = doc.embedded.create(Item, {
    name: "wildcard",
    filters: [nameSearch],
    sort: (a, b) => a.name.localeCompare(b.name),
  });


  function editItem(item) {
    item.sheet.render(true);

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
  function useItem(item) {
    const result = new RollCalcActor({actor: $Actor, item: item, rollType: 'equipment'}).send();

    game.system.log.d('useItem')
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
    .flexrow.inventory-search-bar.pt-sm.pr-sm.justify-vertical()
      .flexcol.flex1.label-container 
        label(for="search") Search
      .flex3.left
        TJSInput({input} role="searchbox") 
      
    div.px-smd.mt-sm.inventory-rows-container
      ol.standard-list
        InventoryRow.header(lockCss="{lockCSS}" toggleLock="{toggleLock}" role="rowheader")
          .li-image.header(slot="c1") 
            .flex0
              .relative.buttons
                .rowimg.button
                  
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
            button.stealth.rowbutton.rowimgbezelbutton(class="{lockCSS}" style="cursor: pointer; min-width: 2.7rem" on:click|preventDefault!="{toggleLock}")
              i.fa(class="{faLockCSS}")
        +each("items as item, index")
          InventoryRow(lockCss="{lockCSS}" index="{index}" toggleLock="{toggleLock}" role="row")
            button.stealth.li-image(slot="c1" on:click="{useItem(item)}")
              img.icon(src="{item.img}" alt="{item.name}")
            div(slot="c2") 
              button.stealth.link(on:click="{showItemSheet(item)}" class="{item.system.isMagic ? 'pulse' : ''}") {item.name}
            div(slot="c3") 
              button.stealth.clickable(data-tooltip="Left click + / Right Click -" on:click!="{addQuantity(item)}" on:contextmenu!="{removeQuantity(item)}") {item.system.quantity}
            button.stealth(slot="c4" on:click="{toggleBookmark(item)}") 
              i.fa-bookmark.row.pointer(class="{item.system.favourite === true ? 'fa-solid' : 'fa-regular'}" )
            div.buttons.actions(slot="c5")
              +if("!$doc.system.inventoryLocked")
                button.stealth.rowbutton.rowimgbezelbutton( on:click="{editItem(item)}")
                  i.left.fa.fa-edit.mr-md
                button.stealth.rowbutton.rowimgbezelbutton( on:click="{duplicateItem(index, item)}")
                  i.left.fa.fa-copy.mr-md
                button.stealth.rowbutton.rowimgbezelbutton( on:click="{deleteItem(index, item)}")
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

      
// input
//   background-color: white
//   height: 1.2rem

.label-container
  justify-content: center

.actions
  display: flex
  flex-wrap: nowrap
  justify-content: flex-end


       

</style>