<script>
  import { getContext, onMount } from "svelte";
  import { rippleFocus } from "#standard/action/animate/composable";
  import { TJSDocument } from "#runtime/svelte/store/fvtt/document";

  import { TJSInput } from "#standard/component/form";
  import { createFilterQuery } from "~/src/filters/itemFilterQuery";
  import { toggleBookmark, ucfirst } from "~/src/helpers/util";
  import { localize } from "#runtime/util/i18n";
  import { SYSTEM_ID, SYSTEM_CODE } from "~/src/helpers/constants";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import ScrollingContainer from "~/src/helpers/svelte-components/ScrollingContainer.svelte";
  import InventoryRow from "~/src/components/molecules/InventoryRow.svelte";
  import RollCalcActor from "~/src/helpers/rolls/RollCalcActor";
  import Badge from "~/src/components/atoms/Badge.svelte";
  import Tag from "~/src/components/atoms/Tag.svelte";

  export let sheet;
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

  onMount(() => {
    // Initial combat state
  });

  /** @type {import('@typhonjs-fvtt/runtime/svelte/store').DynMapReducer<string, Item>} */
  const wildcard = doc.embedded.create(Item, {
    name: "wildcard",
    filters: [typeSearch],
    sort: (a, b) => {
      //- compare a.type to b.type and then a.system.type to b.system.type and then a.name to b.name
      //- for b.system.type place secondary before reaction and primary before secondary
      const typeOrder = [ 'primary', 'secondary', 'reaction'];
      if (a.type === b.type) {
        if (a.system.type === b.system.type) {
          return a.name.localeCompare(b.name)
        }
        return typeOrder.indexOf(a.system.type) - typeOrder.indexOf(b.system.type)
      }
      return a.type.localeCompare(b.type)
    }
  });

  function editItem(item) {
    item.sheet.render(true);
  }

  function addQuantity(item) {
    const quantity = item.system.quantity + 1;
    item.update({ system: { quantity: quantity } });
  }

  function removeQuantity(item) {
    const quantity = item.system.quantity - 1;
    item.update({ system: { quantity: quantity } });
  }

  function duplicateItem(item) {
    const itemData = item.toObject();
    delete itemData._id;
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
        await $Actor.deleteAllItems(["trait", "action"]);
      },
      no: () => {},
    });
  }

  async function resetAllUses() {
    const items = $Actor.items.filter(item => item.system.hasLimitation);
    for (const item of items) {
      await item.update({ 'system.uses': 0 });
    }
  }

  function roll(item) {
    game.system.log.d("roll");
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

    const okToDelete = await Dialog.confirm({
      title: localize("FF15.Types.Actor.Abilities.confirmDeleteJobTitle"),
      content: localize("FF15.Types.Actor.Abilities.confirmDeleteJob"),
      yes: async () => {
        //- get the job by uuid
        const job = await fromUuid($doc.system.job.uuid);
        
        //- get the grants from the job
        const grants = job?.system?.grants;
        if (grants) {

          const grantedItems = [];
          for (let grant of grants.list) {
            const item = await fromUuid(grant.uuid);
            if (item) grantedItems.push(item);
          }
          
          //- find and delete matching items on actor
          const actorItems = $doc.items.filter(x => ['action', 'trait'].includes(x.type));
          
          for (let grantedItem of grantedItems) {
            // Find matching items by name and type
            const matchingItems = actorItems.filter(x => 
              x.name === grantedItem.name && 
              x.type === grantedItem.type
            );
            
            // Delete all matching items
            for (let item of matchingItems) {
              game.system.log.d("Deleting item:", item);
              await item.delete();
            }
          }
        }

        //- update the actor to remove the job uuid
        await $doc.update({ system: { job: { uuid: "", name: "", grants: [], level: null, img: null, role: '' } } });
      },
      no: () => {},
    });
  }

  onMount(async () => {
  });

  $: items = [...$wildcard];
  $: lockCSS = $doc.system.inventoryLocked ? "lock" : "lock-open";
  $: faLockCSS = $doc.system.inventoryLocked ? "fa-lock negative" : "fa-lock-open positive";
  $: hasItems = $Actor.items.some(x=> ['action', 'trait'].includes(x.type));
  
  const badgeType = (item) => {
    return item.system.uses >= item.system.limitation ? 'danger' : 'success';
  }
  

  const actionTypeClass = (item) => {
    return item.type === 'action' ? item.system?.type : 'trait';
  }

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
        //- add in the job item if it exists
        +if("$Actor.system.job?.name")
          h1.left.gold {localize('FF15.Job')}
          table.borderless
            tr
              th.img.shrink(scope="col")
                img.icon(src="{$Actor.system.job?.img}" alt="{$Actor.system.job?.img}")
              th.left.expand.gold.larger(scope="col" on:click="{showItemSheet($Actor.system.job)}" role="button") {ucfirst($Actor.system.job?.name)}
              th.expand.scaleup.kerned.glow.gold.largerer(scope="col") {$Actor.system.job?.level}
              th.buttons(scope="col")
                button.stealth(on:click="{deleteJob}")
                  i.fa-solid.fa-trash


        h1.gold {localize('FF15.Abilities')}
        table.borderless.even
          tr.gold
            th.img.shrink(scope="col")
            th.left.expand.ml-sm(scope="col") {localize('FF15.Name')}
            th(scope="col" colspan="1") Tags
            th.buttons(scope="col" class="{lockCSS}" colspan="2")
              button.stealth(class="{lockCSS}" on:click="{toggleLock}")
                i.fa(class="{faLockCSS}")
          +each("items as item, index")
            //- pre item.type {item.type}
            tr(class="{actionTypeClass(item)}")
              td.img(data-tooltip-class="FF15-tooltip" data-tooltip="{localize('FF15.Use')}" on:click!="{RollCalc.ability(item.type, item)}" role="button")
                img.icon(src="{item.img}" alt="{item.name}")
              td.left.text.ellipsis
                .flexrow
                  .flex3.left(data-tooltip-class="FF15-tooltip wordy" data-tooltip="{item.system.description}")
                    a.stealth.link(class="{item.system.isMagic ? 'pulse' : ''}" role="button" on:click="{showItemSheet(item)}") {item.name}
                  +if("item.system.hasLimitation && game.combat")
                    .flex0.right.ml-sm.pt-s(data-tooltip-class="FF15-tooltip" data-tooltip="{localize('FF15.Types.Item.Types.action.UsesRemaining')}")
                      Badge(type!="{badgeType(item)}") {item.usesRemaining}
              //- td.left {ucfirst(item.type)}
              //- td.left {item.type === 'action' ? ucfirst(item.system?.type || '') : ''}
              td.right.no-wrap
                +if("item.system.tags") 
                  +each("item.system.tags as tag")
                    Tag.badge.small.square({tag}, remover="{false}")
              td.shrink(data-tooltip-class="FF15-tooltip" data-tooltip="{localize('FF15.Bookmark')}")
                button.stealth(on:click="{toggleBookmark(item)}") 
                  i.fa-bookmark(class="{item.system.favourite === true ? 'fa-solid' : 'fa-regular'}" role="button")
              td.min.buttons.right
                +if("!$doc.system.inventoryLocked")
                  button.stealth(data-tooltip-class="FF15-tooltip" data-tooltip="{localize('FF15.Types.Actor.ActionButtons.Edit')}" on:click="{editItem(item)}")
                    i.left.fa.fa-edit(role="button")
                  button.stealth(data-tooltip-class="FF15-tooltip" data-tooltip="{localize('FF15.Types.Actor.ActionButtons.Duplicate')}" on:click="{duplicateItem(index, item)}")
                    i.left.fa.fa-copy(role="button")
                  button.stealth(data-tooltip-class="FF15-tooltip" data-tooltip="{localize('FF15.Types.Actor.ActionButtons.Delete')}" on:click="{deleteItem(index, item)}")
                    i.left.fa.fa-trash(role="button")
            
      +if("hasItems")
        button.mt-sm.glossy-button.gold-light.hover-shine(on:click="{removeAllItems}") - Remove All
        button.glossy-button.gold-light.hover-shine.ml-sm(on:click="{resetAllUses}") Reset Uses

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
  +mixins.buttons

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

// table tr
//   td
//     line-height: 1.5rem
//   &.reaction
//     td:nth-child(2)
//       color: var(--color-reaction)
//   &.primary
//     td:nth-child(2)
//       color: var(--color-primary-action)
//   &.secondary
//     td:nth-child(2)
//       color: var(--color-secondary-action)

table tr
  td
    vertical-align: middle
    line-height: 1.7rem
  &.reaction
    background-color: var(--color-reaction)
    color: white
  &.primary
    background-color: var(--color-primary-action)
    color: white
  &.secondary
    background-color: var(--color-secondary-action)
    color: white
  &.trait
    background-color: var(--color-trait)
    color: white

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

.icon
  cursor: pointer
  margin-left: -1px
  &:hover
    transform: scale(1.1)
    transition: transform 0.2s ease-in-out

</style>
