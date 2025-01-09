<script>
  import { getContext, onMount } from "svelte";
  import { rippleFocus } from "@typhonjs-fvtt/runtime/svelte/action/animate";
  import { TJSDocument } from "@typhonjs-fvtt/runtime/svelte/store/fvtt/document";
  import { TJSInput } from "#standard/component/form";
  import { createFilterQuery } from "~/src/filters/itemFilterQuery";
  import { toggleBookmark, ucfirst } from "~/src/helpers/util";
  import { localize } from "#runtime/util/i18n";
  import { SYSTEM_ID, SYSTEM_CODE } from "~/src/helpers/constants";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import ScrollingContainer from "~/src/helpers/svelte-components/ScrollingContainer.svelte";
  import InventoryRow from "~/src/components/molecules/InventoryRow.svelte";
  import RollCalcActor from "~/src/helpers/RollCalcActor";
  import Badge from "~/src/components/atoms/Badge.svelte";

  const Actor = getContext("#doc");
  const doc = new TJSDocument($Actor);
  const RollCalc = new RollCalcActor({ actor: $Actor });
  const typeSearch = createFilterQuery("type");
  typeSearch.set(["trait", "action"]); // Updated to filter for both types
  const input = {
    store: typeSearch,
    efx: rippleFocus(),
    placeholder: "by Name",
    type: "search",
    id: "search",
  };

  let combat;
  
  function onCombatUpdate() {
    combat = game.combat;
  }

  onMount(() => {
    // Initial combat state
    combat = game.combat;
    
    // Subscribe to combat updates
    Hooks.on('createCombat', onCombatUpdate);
    Hooks.on('deleteCombat', onCombatUpdate);
    Hooks.on('updateCombat', onCombatUpdate);
    
    return () => {
      // Cleanup hooks on component destroy
      Hooks.off('createCombat', onCombatUpdate);
      Hooks.off('deleteCombat', onCombatUpdate);
      Hooks.off('updateCombat', onCombatUpdate);
    };
  });

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
      okToDelete = confirm(game.i18n.localize(`${SYSTEM_CODE}.Types.Actor.Abilities.confirmDeleteItem`));
    }
    if (okToDelete) {
      item.delete();
    }
  }

  async function removeAllItems() {
    const okToDelete = await Dialog.confirm({
      title: localize("FF15.Types.Actor.Abilities.confirmDeleteAllTitle"),
      content: localize("FF15.Types.Actor.Abilities.confirmDeleteAll"),
      yes: async () => {  
        await $Actor.deleteAllItems(["trait", "action", "telegraph"]);
      },
      no: () => {},
    });
  }

  function roll(item) {
    game.system.log.d("roll");
    game.system.log.d(item);
  }
  function useItem(item) {
    const result = new RollCalcActor({ actor: $Actor, item: item, rollType: "equipment" }).send();

    game.system.log.d("useItem");
    game.system.log.d(item);
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

  async function deleteJob() {
    if (!$doc.system.job.uuid) {
      return;
    }

    //- confirm by Dialog
    const okToDelete = await Dialog.confirm({
      title: localize("FF15.Types.Actor.Abilities.confirmDeleteJobTitle"),
      content: localize("FF15.Types.Actor.Abilities.confirmDeleteJob"),
      yes: async () => {
        //- get the job by uuid
        const job = await fromUuid($doc.system.job.uuid);
        //- get the grants from the job
        const grants = job.system.grants;
        //- iterate over the grant (which are uuids) and get the item by uuid
        for (let grant of grants.list) {
          const item = await fromUuid(grant.uuid);
          //- find the corresponding item in the actor by name
          const actorItem = $doc.items.find((x) => x.name === item.name);
          if (actorItem) {
            actorItem.delete();
          }
        }
        //- update the actor to remove the job uuid
        $doc.update({ system: { job: { uuid: "", name: "", grants: [], level: null, img: null, role: '' } } });
      },
      no: () => {},
    });
  }

  onMount(async () => {
    game.system.log.d("items", $doc.items);
  });

  $: items = [...$wildcard];
  $: lockCSS = $doc.system.inventoryLocked ? "lock" : "lock-open";
  $: faLockCSS = $doc.system.inventoryLocked ? "fa-lock negative" : "fa-lock-open positive";
  $: hasItems = $Actor.items.some(x=> ['action', 'trait'].includes(x.type));
  
  const badgeType = (item) => {
    return item.system.uses >= item.system.limitation ? 'danger' : 'success';
  }
  
  const remaining = (item) => {
    return item.system.hasLimitation ? 
      parseInt(item.system.limitation || 0) - parseInt(item.system.uses || 0) : 10;
  } 

</script>

<template lang="pug">

    .panel.overflow.containerx
      .padded
        //- add in the job item if it exists
        +if("$Actor.system.job?.name")
          h1.left.gold {localize('FF15.Job')}
          table.borderless
            tr
              td.img.shrink(scope="col")
                img.icon(src="{$Actor.system.job?.img}" alt="{$Actor.system.job?.img}")
              td.left.expand(scope="col" on:click="{showItemSheet($Actor.system.job)}") {ucfirst($Actor.system.job?.name)}
              td.buttons(scope="col")
                button.stealth(on:click="{deleteJob}")
                  i.fa-solid.fa-trash


        h1.gold Abilities
        table.borderless
          tr
            th.img.shrink(scope="col")
            th.left.expand.ml-sm(scope="col") {localize('FF15.Name')}
            th.fixed(scope="col") {localize('FF15.Type')}
            th.shrink(scope="col")
              i.fa-solid.fa-bookmark
            th.buttons(scope="col" class="{lockCSS}")
              button.stealth(class="{lockCSS}")
                i.fa(class="{faLockCSS}" on:click="{toggleLock}")
          +each("items as item, index")
            //- pre item.type {item.type}
            tr
              td.img
                img.icon(src="{item.img}" alt="{item.name}")
              td.left
                a.stealth.link(on:click="{showItemSheet(item)}" class="{item.system.isMagic ? 'pulse' : ''}") {item.name}
                +if("item.system.hasLimitation && combat")
                  span.ml-sm
                    Badge(type!="{badgeType(item)}") {remaining(item)}
              td {ucfirst(item.type)}
              td
                button.stealth(on:click="{toggleBookmark(item)}") 
                  i.fa-bookmark(class="{item.system.favourite === true ? 'fa-solid' : 'fa-regular'}" )
              td.min.buttons.right
                +if("!$doc.system.inventoryLocked")
                  button.stealth( data-tooltip="{localize('FF15.Types.Actor.ActionButtons.Edit')}" on:click="{editItem(item)}")
                    i.left.fa.fa-edit
                  button.stealth( data-tooltip="{localize('FF15.Types.Actor.ActionButtons.Duplicate')}" on:click="{duplicateItem(index, item)}")
                    i.left.fa.fa-copy
                  button.stealth( data-tooltip="{localize('FF15.Types.Actor.ActionButtons.Delete')}" on:click="{deleteItem(index, item)}")
                    i.left.fa.fa-trash
            
      +if("hasItems")
        button.mt-sm.glossy-button.gold-light.hover-shine(on:click="{removeAllItems}") - Remove All

</template>

<style lang="sass">
@import '../../../../styles/Mixins.sass'

.containerx
  container-type: inline-size

.padded
  transition: padding 0.2s ease-in-out
  @container (min-width: 350px)
    padding: 1rem
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
       

</style>
