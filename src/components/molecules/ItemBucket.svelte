<script>
import { onMount, getContext } from 'svelte';
import { SYSTEM_ID } from '~/src/helpers/constants';
import { ucfirst } from '~/src/helpers/util';
import DocCheckbox from '~/src/components/atoms/controls/DocCheckbox.svelte'

export let title
export let key
export let valuePath = `system.${key}.value`;
export let additionalColumns = []; // Array of {header: string, path: string} objects
export let warnOnCompendiumDrops = true;

const item = getContext("#doc");
let localList = []

$: checkboxValue = $item.system[key]?.value;
$: if ($item.system[key]?.list) {
  updateLocalList();
}

async function updateLocalList() {
  localList = [];
  for (let listItem of $item.system[key].list) {
    try {
      const item = await fromUuid(listItem.uuid);
      if (item) {
        localList = [...localList, item];
      }
    } catch (error) {
      console.error(error);
    }
  }
}

async function onDrop(event) {
  event.preventDefault();
  const data = JSON.parse(event.dataTransfer.getData("text/plain"));
  const droppedItem = await Item.implementation.fromDropData(data);
  if (!droppedItem) return;

  // Check if it's a non-compendium drop and warning is enabled
  if (warnOnCompendiumDrops && !droppedItem.uuid.startsWith('Compendium.')) {
    const confirmed = await Dialog.confirm({
      title: "Non-Compendium Item",
      content: `<p>Warning: You are adding an item from the game world rather than from a compendium. If this item is deleted from the game, it could cause inconsistencies.</p><p>Are you sure you want to add this item?</p>`,
      yes: () => true,
      no: () => false,
      defaultYes: false
    });
    
    if (!confirmed) return;
  }

  const list = [...$item.system[key].list];
  list.push({ uuid: droppedItem.uuid });

  await $item.update({ [`system.${key}.list`]: list });
}

async function deleteLink(index) {
  const list = [...$item.system[key].list];
  list.splice(index, 1);
  await $item.update({ [`system.${key}.list`]: list });
}

function showItemSheet(item) {
  item.sheet.render(true);
}

</script>

<template lang="pug">
  .item-bucket(role="application" aria-dropeffect="link" on:drop|preventDefault|stopPropagation="{onDrop}")
    .flexrow.sheet-row.justify-vertical
      .flex3
          h2.wide {title}
      .flex0.right
        DocCheckbox.right.wide(
        {...$$restProps}
        valuePath="{valuePath}"
      )
    slot
    +if("checkboxValue")
      table.standard-list.small-text.borderless
        tr
          th.img.shrink(scope="col")
          th.left.expand(scope="col") Name
          th.left.fixed(scope="col") Item Type
          +each("additionalColumns as col")
            th.left.fixed(scope="col") {col.header}
          th.buttons
            button.stealth
              i.fa.fa-trash
        +each("localList as item, index")
          tr
            td.img
              img.icon.nopointer(src="{item.img}" alt="{item.name}")
            td.left.pointer(on:click!="{showItemSheet(item)}") {item?.name}
            td.left {ucfirst(item?.type)}
            +each("additionalColumns as col")
              td.left {item.type === col.itemType ? ucfirst(item.system?.[col.path] || '') : ''}
            td.buttons.right
              button.stealth(on:click!="{() => deleteLink(index)}")
                i.left.fa.fa-trash.pointer

</template>

<style lang="sass">
@import '../../styles/Mixins.sass'

.item-bucket
  padding: 0.5em
  margin-bottom: 1em
  border: 1px solid rgba(0, 0, 0, 0.1)
  border-radius: 3px

.standard-list
  width: 100%
  margin-top: 0.5em

  th, td
    padding: 0.3em
    &.img
      width: 40px
    &.buttons
      width: 40px
      text-align: right

.icon
  width: 36px
  height: 36px
  object-fit: cover
  border: none

.buttons
  button
    opacity: 0.7
    &:hover
      opacity: 1
</style>
