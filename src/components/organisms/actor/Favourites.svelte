<script>
  import { getContext, onMount } from "svelte";
  import { rippleFocus } from "@typhonjs-fvtt/runtime/svelte/action/animate";
  import { TJSDocument } from "@typhonjs-fvtt/runtime/svelte/store/fvtt/document";
  import { TJSInput } from "@typhonjs-fvtt/svelte-standard/component";
  import { createFilterQuery } from "~/src/filters/itemFilterQuery";
  import { toggleBookmark } from "~/src/helpers/util";
  import { localize } from "#runtime/svelte/helper";
  import { SYSTEM_ID, SYSTEM_CODE } from "~/src/helpers/constants";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import ScrollingContainer from "~/src/helpers/svelte-components/ScrollingContainer.svelte";
  import InventoryRow from "~/src/components/molecules/InventoryRow.svelte";
  import RollCalcActor from "~/src/helpers/RollCalcActor";
  import Badge from "~/src/components/atoms/Badge.svelte";

  const Actor = getContext("#doc");
  const doc = new TJSDocument($Actor);
  const typeSearch = createFilterQuery("system.favourite");
  typeSearch.set(true)
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

  function deleteItem(index, item) {
    let okToDelete = true;
    if (game.settings.get(SYSTEM_ID, "confirmBeforeDeletingActorItem")) {
      okToDelete = confirm(game.i18n.localize(`${SYSTEM_CODE}.Types.Actor.Inventory.confirmDeleteItem`));
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
    switch (item.type) {
      case 'action':
        new RollCalcActor({ actor: $Actor}).ability(item.type, item);
        break;

      case 'trait':
        new RollCalcActor({ actor: $Actor}).ability(item.type, item);
        break;

      case 'equipment':
        new RollCalcActor({ actor: $Actor }).equipment(item);
        break;

      case 'effect':
        ui.notifications.warn("Effects cannot be used directly");
        break;

      case 'job':
        ui.notifications.warn("Jobs cannot be used directly");
        break;

      case 'limitbreak':
        new RollCalcActor({ actor: $Actor}).ability(item.type, item);
        break;

      case 'telegraph':
        new RollCalcActor({ actor: $Actor}).ability(item.type, item);
        break;

      default:
        console.warn(`Unhandled item type: ${item.type}`);
        new RollCalcActor({ actor: $Actor }).send();
    }
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
  
  const badgeType = (item) => {
    return item.system.uses >= item.system.limitation ? 'danger' : 'success';
  }
  
  const remaining = (item) => {
    return item.system.hasLimitation ? 
      parseInt(item.system.limitation || 0) - parseInt(item.system.uses || 0) : 10;
  } 
</script>

<template lang="pug">
.favourites({...$$restProps})
  h2.font-cinzel {localize("Favourites.Title")}
  div.pa-xs
    table.borderless
      tr
        th.img.shrink(scope="col")
        th.left.expand(scope="col") {localize(`${SYSTEM_CODE}.Name`)}
        th.fixed(scope="col") 
        th.shrink(scope="col")
          
      +each("items as item, index")
        tr
          td.img
            img.icon(src="{item.img}" alt="{item.name}"  on:click="{useItem(item)}")
          td.left.clip
            a.ml-sm.stealth.link(on:click="{showItemSheet(item)}" class="{item.system.isMagic ? 'pulse' : ''}") {item.name}
            +if("item.system.hasLimitation && game.combat")
              span.ml-sm
                Badge(type!="{badgeType(item)}") {remaining(item)}
          td
          td
            button.stealth(on:click="{toggleBookmark(item)}") 
              i.fa-bookmark(class="{item.system.favourite === true ? 'fa-solid' : 'fa-regular'}" )
          
          
            
</template>

<style lang="sass">
@import '../../../styles/Mixins.sass'
.favourites
  +inset(0.5rem, 0 0 5px rgba(165,0,0,1) inset)
  width: 100%
.fa-bookmark
  color: var(--color-highlight) !important
.portrait-frame
  margin-right: -2px
  z-index: 2
.pulse
  @include pulse

  .buttons
  @include buttons

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

ol
  height: 100%
  margin: 0
  padding: 0.1rem
  border: 1px solid grey
  li
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

input
  background-color: white
  height: 1.2rem
       
td
  &.clip
    text-overflow: ellipsis
    overflow: hidden
    height: 2rem
    max-height: 2rem
    display: block
</style>
