<script>
import { onMount, getContext } from 'svelte';
import { SYSTEM_ID } from '~/src/helpers/constants';
import { ucfirst, localize } from '~/src/helpers/util';
import DocCheckbox from '~/src/components/atoms/controls/DocCheckbox.svelte'
import Tag from "~/src/components/atoms/Tag.svelte";

export let title
export let key
export let valuePath = `system.${key}.value`;
export let additionalColumns = []; // Array of {header: string, path: string} objects
export let warnOnCompendiumDrops = true;
export let preventDuplicates = true;

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
      } else {
        // Add a placeholder for invalid items
        localList = [...localList, {
          name: "Missing Item",
          type: "unknown",
          img: "icons/svg/hazard.svg",
          uuid: '',
          isMissing: true
        }];
      }
    } catch (error) {
      console.error(error);
      // Add a placeholder for errored items
      localList = [...localList, {
        name: "Invalid Item",
        type: "error",
        img: "icons/svg/hazard.svg",
        uuid: listItem.uuid,
        isMissing: true
      }];
    }
  }
}

// Process a single item and add it to the lists if valid
async function processItem(item, list, isJob, sourceContext = {}) {
  if (!item) return;

  game.system.log.o("ItemBucket:processItem", "Processing item:", { 
    item, 
    uuid: item.uuid,
    type: item.type,
    list: list.map(x => x.uuid),
    sourceContext
  });

  // Skip if item already exists in list
  const existingInList = list.some(existing => existing.uuid === item.uuid);
  
  if (preventDuplicates && existingInList) {
    game.system.log.w(`${item.name} is already in the list.`);
    return;
  }

  // Check if it's a non-compendium item and warning is enabled
  if (warnOnCompendiumDrops && !item.uuid.startsWith('Compendium.')) {
    const confirmed = await Dialog.confirm({
      title: "Non-Compendium Item",
      content: `<p>Warning: You are adding an item from the game world rather than from a compendium. If this item is deleted from the game, it could cause inconsistencies.</p><p>Are you sure you want to add this item?</p>`,
      yes: () => true,
      no: () => false,
      defaultYes: false
    });
    
    if (!confirmed) return;
  }

  // Add item to list
  game.system.log.o("ItemBucket:processItem", "Adding item to list:", { uuid: item.uuid });
  list.push({ uuid: item.uuid });

  // If this is a job and we're dropping an action with enabled traits
  if (isJob && item.type === 'action' && item.system.enables?.value) {
    // Get all enabled traits from the action
    const enabledTraits = item.system.enables.list || [];
    
    game.system.log.o("ItemBucket:processItem", "Processing enabled traits:", enabledTraits);
    
    // Add each enabled trait that isn't already in the list
    for (const trait of enabledTraits) {
      const traitExists = list.some(existing => existing.uuid === trait.uuid);
      game.system.log.o("ItemBucket:processItem", "Checking trait:", { trait, exists: traitExists });
      
      if (!traitExists) {
        // Verify the trait exists before adding it
        const traitItem = await fromUuid(trait.uuid);
        if (traitItem) {
          game.system.log.o("ItemBucket:processItem", "Adding verified trait to list:", trait.uuid);
          list.push({ uuid: trait.uuid });
        } else {
          game.system.log.w("ItemBucket:processItem", `Failed to find trait with UUID: ${trait.uuid}`, {
            sourceAction: {
              name: item.name,
              id: item._id,
              uuid: item.uuid
            },
            sourceFolder: sourceContext,
            invalidTrait: trait
          });
        }
      }
    }
  }
}

// Recursively process a folder and its contents
async function processFolder(folder, list, isJob) {
  const folderContext = {
    name: folder.name,
    id: folder._id,
    uuid: folder.uuid
  };

  game.system.log.o("ItemBucket:processFolder", "Processing folder:", {
    folder: folderContext,
    contents: folder?.contents,
    children: folder?.children,
    entries: folder?.children?.[0]?.entries
  });

  if (!folder) return;

  // Process each child folder
  if (folder.children?.length) {
    game.system.log.o("ItemBucket:processFolder", "Processing child folders:", folder.children);
    for (const child of folder.children) {
      game.system.log.o("ItemBucket:processFolder", "Processing child:", child);
      
      // Process entries in this child folder
      if (child.entries?.length) {
        game.system.log.o("ItemBucket:processFolder", "Processing entries:", child.entries);
        for (const entry of child.entries) {
          game.system.log.o("ItemBucket:processFolder", "Processing entry:", entry);
          const item = await fromUuid(entry.uuid);
          await processItem(item, list, isJob, folderContext);
        }
      }

      // If this child has nested folders, process them
      if (child.children?.length) {
        const subFolder = await fromUuid(child.folder.uuid);
        await processFolder(subFolder, list, isJob);
      }
    }
  }

  // Process any direct contents (for non-compendium folders)
  if (folder.contents?.length) {
    game.system.log.o("ItemBucket:processFolder", "Processing folder contents:", folder.contents);
    for (const content of folder.contents) {
      if (content.type === "Folder") {
        game.system.log.o("ItemBucket:processFolder", "Found nested folder:", content);
        const subFolder = await fromUuid(content.uuid);
        await processFolder(subFolder, list, isJob);
      } else {
        game.system.log.o("ItemBucket:processFolder", "Processing item from folder:", content);
        const item = await fromUuid(content.uuid);
        await processItem(item, list, isJob, folderContext);
      }
    }
  }
}

async function onDrop(event) {
  event.preventDefault();
  const data = JSON.parse(event.dataTransfer.getData("text/plain"));
  game.system.log.o("ItemBucket:onDrop", "Drop data:", data);
  
  // Get current lists
  const list = [...$item.system[key].list];
  const isJob = $item.type === 'job';

  game.system.log.o("ItemBucket:onDrop", "Current state:", {
    key,
    list: list.map(x => x.uuid),
    isJob
  });

  // Handle folder drops
  if (data.type === "Folder") {
    game.system.log.o("ItemBucket:onDrop", "Handling folder drop");
    const folder = await fromUuid(data.uuid);
    game.system.log.o("ItemBucket:onDrop", "Retrieved folder:", folder);
    await processFolder(folder, list, isJob);

    game.system.log.o("ItemBucket:onDrop", "Final list after folder processing:", list.map(x => x.uuid));
    await $item.update({ [`system.${key}.list`]: list });
    return;
  }

  // Handle single item drops
  const droppedItem = await Item.implementation.fromDropData(data);
  await processItem(droppedItem, list, isJob);
  
  game.system.log.o("ItemBucket:onDrop", "Final list after item processing:", list.map(x => x.uuid));
  await $item.update({ [`system.${key}.list`]: list });
}

async function deleteLink(index) {
  const list = [...$item.system[key].list];
  list.splice(index, 1);
  await $item.update({ [`system.${key}.list`]: list });
}

async function removeAllItems() {
  const okToDelete = await Dialog.confirm({
    title: localize("Types.Actor.Abilities.confirmDeleteAllTitle"),
    content: localize("Types.Actor.Abilities.confirmDeleteAll"),
    yes: async () => {  
      await $item.update({ [`system.${key}.list`]: [] });
    },
    no: () => {},
  });
}

function showItemSheet(item) {
  item.sheet.render(true);
}

$: activeClass = checkboxValue ? 'active' : '';
$: hasItems = localList.length > 0;

</script>

<template lang="pug">
  .item-bucket(class="{activeClass}" role="application" aria-dropeffect="link" on:drop|preventDefault|stopPropagation="{onDrop}")
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
          th.img.expand(scope="col")
          th.left.expand.no-wrap(scope="col") {localize("Name")}
          th.left.shrink(scope="col") {localize("Type")}
          +each("additionalColumns as col")
            th.left.fixed(scope="col") {col.header}
          th.buttons
            button.stealth
        +each("localList as item, index")
          tr(class="{item.isMissing ? 'missing-item' : ''}")
            td.img
              img.icon.nopointer(src="{item.img}" alt="{item.name}")
            td.left.pointer.no-wrap(class="{item.isMissing ? 'missing-text' : ''}" on:click!="{() => !item.isMissing && showItemSheet(item)}")
              span {item.isMissing ? `${item.name} (${item.uuid})` : item?.name}
            td.left {ucfirst(item?.type)}
            +each("additionalColumns as col")
              td.left {item.type === col.itemType ? ucfirst(item.system?.[col.path] || '') : ''}
            td.buttons.right
              button.stealth(on:click!="{() => deleteLink(index)}")
                i.left.fa.fa-trash.pointer
    +if("checkboxValue && hasItems")
      button.mt-sm.glossy-button.gold-light.hover-shine(on:click="{removeAllItems}") - Remove All
    +if("checkboxValue && localList.length === 0")
      .empty-list
        p.empty-list-text Drop items here to add them to the list.

</template>

<style lang="sass">
@use '../../styles/_mixins' as mixins

.item-bucket
  padding: 0.5em
  margin-bottom: 1.5em
  &.active
    transition: background-color 0.3s ease
    border: 1px solid rgba(0, 0, 0, 0.1)
    border-radius: 3px
    background-color: var(--color-lowlight)

.missing-item
  opacity: 0.6
  background-color: rgba(255, 0, 0, 0.1) !important

.missing-text
  color: #ff6b6b
  font-style: italic
  cursor: not-allowed

.empty-list
  padding: 0.5em
  margin-bottom: 1em
  border: 3px dotted var(--ff-border-color)
  border-radius: 10px
  text-align: center
  color: silver

table.standard-list
  width: 100%
  margin-top: 0.5em
  color: white
  tr
    position: relative
    td:first-child
      border-bottom-left-radius: 7px
      border-top-left-radius: 7px
    &:nth-child(even)
      background-color: var(--color-lowlight-dark)
    &:not(:first-child):nth-child(odd)
      background-color: var(--color-lowlight-dark)
      td
        border-top: 2px solid transparent
        border-bottom: 2px solid transparent

  th
    color: wheat
  th, td
    padding: 0 0.3em
    &.img
      img
        position: absolute
        left: 0
        top: -5px
        width: 36px
        height: 36px
        object-fit: cover
        border: none
    &.buttons
      width: 40px
      text-align: right
    &:not(:first-child)
      border-bottom: 2px solid transparent

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
