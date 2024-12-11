<script>
import { onMount, getContext, onDestroy } from 'svelte';
import { deleteItemLink, onDropItemOnItem, updateList } from '~/src/helpers/itemLinks'
import DocCheckbox from '~/src/components/atoms/controls/DocCheckbox.svelte'
// import DocumentCheckboxInput from '~/src/components/atoms/controls/DocumentCheckboxInput.svelte'

export let title
export let key
export let initialChecked = false;

const doc = getContext("#doc");

let localList = []
let storedList
let checkboxValue = initialChecked


$: checkboxValue = $doc.system?.[key].value;
$: storedList = $doc.system?.[key];
$: valuePath = `system.${key}.value`

async function onDrop(event) {
  game.system.log.d('onDrop event', event);
  game.system.log.d('onDrop key', key);
  const result = await onDropItemOnItem(event, $doc, key);
  if (!result) return;
  localList = await updateList(localList, storedList.list, result[key].uuid);
}


async function deleteLink(index) {
  await deleteItemLink($doc, key, index)
  localList = await updateList(localList, storedList.list);
}


onMount(async () => {
  localList = await updateList(localList, storedList.list);
});

</script>

<template lang="pug">
  .item-bucket(role="application" aria-dropeffect="link" on:drop|preventDefault|stopPropagation="{onDrop}")
    h2.flex.mt-none {title}
      //- DocumentCheckboxInput(
      DocCheckbox(
        {...$$restProps}
        valuePath="{valuePath}"
      )
    slot
    +if("checkboxValue")
      table.standard-list.small-text.borderless
        tr
          th.img.shrink(scope="col")
          th.left.expand(scope="col") Name
          th.left.fixed(scope="col") Type
          th.buttons
            button.stealth
              i.fa.fa-trash
        +each("localList as item, index")
          //- pre item.type {item.type}
          tr
            td.img
              img.icon(src="{item.img}" alt="{item.name}")
            td.left {item?.name}
            td.left {item?.type}
            td.buttons.right
              button.stealth(on:click!="{() => deleteLink(index)}")
                i.left.fa.fa-trash.pointer

</template>

<style lang="sass">
  @import '../../styles/Mixins.sass'
  .item-bucket
    padding: 0 0.4rem
    .flexrow
      gap: 4px
    .avatar
      min-width: 30px
    ol
      padding: 0
      margin: 0
      li
        background-color: rgba(255, 255, 255, 0.4)
    
</style>
