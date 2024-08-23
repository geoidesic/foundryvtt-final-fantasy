<svelte:options accessors={true} />

<script>
  import { getContext, onMount } from "svelte";
  import { rippleFocus } from "@typhonjs-fvtt/runtime/svelte/action/animate";
  import { TJSInput } from "@typhonjs-fvtt/svelte-standard/component";
  import { createFilterQuery } from "~/filters/inventoryFilterQuery";
  import { TJSDocument } from "@typhonjs-fvtt/runtime/svelte/store/fvtt/document";
  import { log, toggleBookmark } from "~/helpers/Utility";
  import NumericInputValidator from "~/components/actor/NumericInputValidator";
  import XPcalc from "~/helpers/XPcalc.js";

  import {
    validateNumericInput,
    containedWeight,
    containerIsFull,
    containerCanContain,
    locationIsContainer,
    containerAvailableSpace,
    getItemSpecialisation,
    weightByQuality,
  } from "~/helpers/Utility.js";
  import {
    inventoryOptions,
    rollableCharacteristics,
    inventory,
    nonContainerLocations,
    inHandLocations,
  } from "~/helpers/Constants.js";
  import ScrollingContainer from "~/helpers/svelte-components/ScrollingContainer.svelte";
  import DocumentTextInput from "~/components/elements/DocumentTextInput.svelte";
  import DocumentSelect from "~/components/elements/DocumentSelect.svelte";
  import LocationSelect from "~/components/elements/LocationSelect.svelte";
  import TextInput from "~/helpers/svelte-components/input/TextInput.svelte";
  import ItemInput from "~/components/item/ItemInput.svelte";
  import InventoryRow from "~/components/actor/InventoryRow.svelte";
  import Encumbrance from "~/components/actor/Encumbrance.svelte";
  import Select from "~/helpers/svelte-components/select/Select.svelte";
  import ActorRollCalc from "../../helpers/RollCalc/ActorRollCalc";

  export let sheet;

  const xpValidator = new NumericInputValidator();
  const XP = new XPcalc($doc);

  const Actor = getContext("#doc");
  const doc = new TJSDocument($Actor);
  const nameSearch = createFilterQuery("name");
  const typeSearch = createFilterQuery("type");
  const typeFilterOptions = [
    {
      value: "all",
      label: "All",
    },
    ...inventoryOptions,
  ];
  const input = {
    store: nameSearch,
    efx: rippleFocus(),
    placeholder: "by Name",
    type: "search",
  };

  /** @type {import('@typhonjs-fvtt/runtime/svelte/store').DynMapReducer<string, Item>} */
  const wildcard = doc.embedded.create(Item, {
    name: "wildcard",
    filters: [nameSearch, typeSearch],
    sort: (a, b) => a.name.localeCompare(b.name),
  });

  function addHandsRequiredOptions(item) {}

  async function removeLevel(item) {
    // game.system.log.d("removeLevel");
    let itemSpecialisation = getItemSpecialisation($doc, item);
    // game.system.log.d("itemSpecialisation", itemSpecialisation);

    if (!itemSpecialisation) return;
    const currentLevel = parseInt(itemSpecialisation.level);
    const newLevel = currentLevel - 1;

    const currentLevelCost = XP.levelCost(currentLevel, 0);
    const newLevelCost = XP.levelCost(newLevel, 0);
    const difference = currentLevelCost - newLevelCost;

    if (currentLevel > 0) {
      const unspent = $doc.system.xp.unspent + difference;
      const xp = newLevelCost;
      const xpLog = $doc.system.xpLog;
      const timestamp = new Date().toISOString();

      xpLog.push({
        userId: game.user._id,
        timestamp,
        description: `Reduced ${item.name} [${item.system.code}] specialisation level`,
        amount: difference,
      });
      await $doc.update({
        system: { specialisations: { [item.system.code]: { level: newLevel, xp } }, xpLog, xp: { unspent } },
      });
    } else {
      ui.notifications.error(`Cannot decrease level below zero.`);
    }
  }

  async function addLevel(item) {
    // check if the specialisation exists
    let itemSpecialisation = getItemSpecialisation($doc, item);

    // if not, create it
    if (!itemSpecialisation) {
      await $doc.update({ system: { specialisations: { [item.system.code]: { level: 0, xp: 0 } } } });
      itemSpecialisation = getItemSpecialisation($doc, item);
    }
    // update the skill level
    // handle XP
    const currentLevel = parseInt(itemSpecialisation.level);
    const newLevel = currentLevel + 1 || 0 + 1;
    const currentLevelCost = XP.levelCost(currentLevel, 0);
    const newLevelCost = XP.levelCost(newLevel, 0);
    const difference = newLevelCost - currentLevelCost;

    // game.system.log.d("currentLevel", currentLevel);
    // game.system.log.d("newLevel", newLevel);
    // game.system.log.d("currentLevelCost", currentLevelCost);
    // game.system.log.d("newLevelCost", newLevelCost);
    // game.system.log.d("difference", difference);


    if ($doc.system.xp.unspent >= difference) {
      const unspent = $doc.system.xp.unspent - difference;
      const xp = newLevelCost;
      const xpLog = $doc.system.xpLog;
      const timestamp = new Date().toISOString();

      xpLog.push({
        userId: game.user._id,
        timestamp,
        description: `Increased ${item.name} [${item.system.code}] specialisation level`,
        amount: -difference,
      });
      await $doc.update({
        system: { specialisations: { [item.system.code]: { level: newLevel, xp } }, xpLog, xp: { unspent } },
      });
    } else {
      ui.notifications.error(`Insufficient Unspent XP. New level requires ${difference} Unspent XP`);
    }
  }

  function deleteItem(index, item) {
    // if item is of type container, then iterate through its contents and set their location to extraneous
    if (item.type === "container") {
      const contents = $doc.items.filter((i) => i.system.location === item._id);
      if (contents.length > 0) {
        let confirmed = confirm(
          `Are you sure you want to delete ${item.name}? It is a container with contents, which will be dropped on deletion.`
        );
        if (!confirmed) return;
      }
      for (let content of contents) {
        content.update({ system: { location: "extraneous" } });
      }
    }
    item.delete();
  }

  function editItem(index, item) {
    item.sheet.render(true);
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
  function toggleCarried(item) {
    item.update({ ["system.equipped"]: !item.system.equipped });
  }

  function removeTrailingZeros(number) {
    const str = number.toString();
    const trimmed = str.replace(/\.?0+$/, "");
    return trimmed;
  }

  function rowWeight(item) {
    let val = 0;
    val += parseFloat(item.system.quantity) * parseFloat(item.system.weight);
    if (item.type === "container") {
      val += containedWeight($doc, item);
    }
    return isNaN(val) ? 0 : val.toFixed(2);
  }

  function capacityClass(item) {
    const contained = containedWeight($doc, item);
    const capacity = parseFloat(item.system.capacity).toFixed(2);
    return item.type === "container" && contained >= capacity ? "full" : "";
  }

  function addQuantity(item) {
    const container = $doc.items.get(item.system.location);
    const isContainer = locationIsContainer(item.system.location);
    const isFull = container ? containerIsFull($doc, container) : false;
    if (isContainer && isFull) {
      ui.notifications.warn("Container is full");
      return;
    }
    const quantity = item.system.quantity + 1;
    item.update({ system: { quantity: quantity } });
  }

  function removeQuantity(item) {
    const quantity = item.system.quantity - 1;
    item.update({ system: { quantity: quantity } });
  }

  function duplicateItem(index, item) {
    game.system.log.d('duplicateItem', index, item);
    const itemData = item.toObject();
    delete itemData._id;
    game.system.log.d('itemData', itemData);
    $Actor.sheet._onDropItemCreate(itemData)
  }

  function updateLocation(item, value) {
    // if container is full, show a notification
    const isContainer = locationIsContainer(value);
    const container = isContainer ? $doc.items.get(value) : value;
    if (!isContainer || containerCanContain($doc, container, item)) {
      item.update({ ["system.location"]: value });
      return true;
    } else {
      ui.notifications.notify(`${container.name} is full. Cannot place this item within.`, "error");
      return false;
    }
  }

  function showItemSheet(item) {
    item.sheet.render(true);
  }

  function addItem() {
    game.packs.get("surge.equipment").render(true);
  }

  // @deprecated: not using inputs anymore for quantity
  // function maxQuantity(item) {
  //   if (!item.system.quantity) return undefined;
  //   if (item.system.location === "worn") return 1;
  //   if (inHandLocations.includes(item.system.location)) {
  //     return 1;
  //   }
  //   if (locationIsContainer(item.system.location)) {
  //     const container = $doc.items.get(item.system.location);
  //     const available = containerAvailableSpace($doc, container).toFixed(2);
  //     if (available < item.system.weight) {
  //       return item.system.quantity;
  //     } else {
  //       return parseFloat(container.system.capacity).toFixed(2) / item.system.weight;
  //     }
  //   }
  //   return undefined;
  // }

  onMount(async () => {
    if (!$doc.system.specialisations) {
      await $doc.update({ system: { specialisations: {} } });
    }
  });

  let typeFilterValue;

  $: typeSearch.set(typeFilterValue);
  $: items = [...$wildcard];
  $: lockCSS = $doc.system.inventoryLocked ? "lock" : "lock-open";
  $: faLockCSS = $doc.system.inventoryLocked ? "fa-lock negative" : "fa-lock-open positive";
  $: filteredWeight = items.reduce((sum, item) => {
    if (!inventory.includes(item.type)) return sum;
    if (item.system.location === "" || item.system.location === "extraneous") return sum;

    // worn items or weapons in hand have enc. adjusted by quality
    if (item.system.location === "worn" || (item.type === "weapon" && inHandLocations.includes(item.system.location))) {
      sum += weightByQuality(item);
      return sum;
    }
    // stored in container
    if (item.system?.location && !nonContainerLocations.includes(item.system.location)) {
      const container = $doc.items.get(item.system.location);
      if (!container || container?.system?.location === "" || container?.system?.location === "extraneous") return sum;
      sum += weightByQuality(item, container);
      return sum;
    }
    sum += (parseFloat(item.system.weight) || 0) * (parseInt(item.system.quantity) || 0);
    return sum;
  }, 0);
</script>

<template lang="pug">
  ScrollingContainer
    .flexrow.pt-sm.pr-sm
      .flexcol.flex1.label-container 
        label Search
      .flex3.left
        TJSInput({input}) 
      .flexcol.flex1.label-container 
        label Type
      .flex3.right
        Select(options="{typeFilterOptions}" bind:value="{typeFilterValue}")
    

    div.pa-sm
      ol
        InventoryRow.header(lockCss="{lockCSS}" toggleLock="{toggleLock}")
          div(slot="c1") 
            i.left.fa.fa-add.mr-md( on:click="{addItem}")

          div(slot="c2") 
            div Name
          div(slot="c3")
            div Quantity
          div(slot="c8")
            div Level
          div(slot="c4")
            span {filteredWeight.toFixed(2)}
            i.fas.fa-weight-hanging
          div(slot="c5") 
            i.fas.fa-person-walking-luggage
          div(slot="c6")
            div
              i.fa-solid.fa-bookmark
          div(slot="c7") 
            div.rowbutton.rowimgbezelbutton(class="{lockCSS}" style="cursor: pointer" on:click|preventDefault!="{toggleLock}")
              i.fa(class="{faLockCSS}")
        +each("items as item, index")
          InventoryRow.relative(lockCss="{lockCSS}" index="{index}" toggleLock="{toggleLock}")
            div(slot="c1")
              div.flex0
                div.relative.buttons
                  +if("rollableCharacteristics.includes(item.type)")
                    div.rowimg.button.rowimgbezelbutton(on:click!="{new ActorRollCalc({item: item, actor: $doc, code: 'size', rollType: 'inventory'}).send()}")
                      img.left.flex0(src="{item.img}" )
                    +else()
                      div.rowimg
                        img.left.flex0(src="{item.img}" )
            div(slot="c2") 
              div.pointer.link(on:click="{showItemSheet(item)}" class="{item.system.isMagic ? 'pulse' : ''}") {item.name}
            div(slot="c3") 
              .clickable(data-tooltip="Left click + / Right Click -" on:click!="{addQuantity(item)}" on:contextmenu!="{removeQuantity(item)}") {item.system.quantity}
            div(slot="c4" class="{capacityClass(item)}") 
              +if("item.type === 'container'")
                div {removeTrailingZeros(rowWeight(item))}
                  span &nbsp;/ {parseInt(item.system.capacity) + parseInt(item.system.weight)}
                +else()
                  div {removeTrailingZeros(rowWeight(item))}
            div(slot="c8")
              +if("item.type === 'weapon'")
                .clickable(data-tooltip="Left click + / Right Click -" on:click!="{addLevel(item)}" on:contextmenu!="{removeLevel(item)}") {$doc.system.specialisations?.[item.system.code]?.level || 0}
            
            div(slot="c5") 
              +if("inventory.includes(item.type)")
                LocationSelect( style="min-width: 130px; max-width: 130px" doc="{doc}" item="{item}" value="{item.system.location}" handle="{updateLocation}")

            div(slot="c6") 
              i.fa-bookmark.row(class="{item.system.bookmarked === true ? 'fa-solid' : 'fa-regular'}" on:click="{toggleBookmark(item)}")

            //- div(slot="c7")
            //-   input(type='checkbox' checked="{!item.equipped}" on:change="{toggleCarried(item)}")
            div.buttons.actions(slot="c7")
              +if("!$doc.system.inventoryLocked")
                div.rowbutton.rowimgbezelbutton
                  i.left.fa.fa-edit.mr-md( on:click="{editItem(index, item)}")
                div.rowbutton.rowimgbezelbutton
                  i.left.fa.fa-copy.mr-md( on:click="{duplicateItem(index, item)}")
                div.rowbutton.rowimgbezelbutton
                  i.left.fa.fa-trash.mr-md( on:click="{deleteItem(index, item)}")
            
        li.flexrow.footer
          div.flex0
            div.mr-sm Enc.
          .flex3.left
            div.flexrow
              div.left.flex1 
                Encumbrance(className="value")
              div.flex3.enc.center
                Encumbrance(className="bg")
          .flex1
            div Weight
          .flex0
            Encumbrance(className="total") 
          | lb.
          //- div.flexrow.ml-sm 
          //-   div AP 
          //-   div.right {$doc.system.AP}
        

</template>

<style lang="scss" scoped>
  @import "../../styles/Mixins.scss";
  .pulse {

    @include pulse;
  }
  .buttons {
    @include buttons;
  }
  .fa.fa-add {
    cursor: pointer;
    &:hover {
      background-color: var(--sheet-color);
      color: var(--sheet-contrast);
    }
  }
  .clickable {
    max-height: 1.3rem;
    line-height: 1.3rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(255, 255, 255, 0.2);
  }
  img {
    border: none;
    width: 20px;
    height: 20px;
  }

  .inverted {
    transform: scalex(-1);
  }

  i {
    padding: 0;
    margin: 0;
  }

  .full {
    color: var(--color-negative);
  }
  ol {
    height: 100%;
    margin: 0;
    padding: 0.1rem;
    border: 1px solid grey;
    li,
    :global(li) {
      padding: 3px;
      margin: 0 2px 2px 2px;
      align-items: center;
      &:not(.header):not(.footer) {
        background-color: #cdc8c7;
      }
      &.header {
        padding: 0 3px;
        line-height: 1rem;
        text-align: top;
        justify-content: top;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        margin-bottom: 0;
        border-bottom: none;
      }
    }
  }

  // .rowimgbezelbutton.down {
  //   -webkit-box-shadow: inset 0 1px 1px #aaa, inset 0 8px 16px -4px #aaa, inset 0 -1px 1px #aaa;
  //   border-color: #888 #aaa #eee;
  // }

  input {
    background-color: white;
    height: 1.2rem;
  }

  .label-container {
    justify-content: center;
  }
</style>
