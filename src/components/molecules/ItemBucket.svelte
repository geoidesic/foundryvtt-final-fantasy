<script>
import { onMount, getContext, onDestroy } from 'svelte';
import { deleteItemLink, onDropItemOnItem, updateList } from '~/src/helpers/itemLinks'
import DocCheckbox from '~/src/components/atoms/controls/DocCheckbox.svelte'
// import DocumentCheckboxInput from '~/src/components/atoms/controls/DocumentCheckboxInput.svelte'

export let title
export let key;
export let initialChecked = false;

const doc = getContext("#doc");

let localList = []
let storedList
let checkboxValue = initialChecked


$: checkboxValue = $doc.system?.[key].value;
$: storedList = $doc.system[key];

async function onDrop(event) {
  game.system.log.d('onDrop event', event);
  game.system.log.d('onDrop key', key);
  const result = await onDropItemOnItem(event, $doc, key);
  // if (!result) return;
  // localList = await updateList(localList, storedList.list, result[key].uuid);
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
        valuePath="system.grants.value"
      )
    slot
    .flexrow.left.mt-xs
      +if("checkboxValue")
        .flexcol
          .flexrow.justify-vertical
            .flex0.avatar
            .flex2
              h4.document-name Name
            .flex1
              h4.document-name Type
            .flex0.pr-sm
              i.right

          ol
            +each("localList as link, index")
              li.flexrow.justify-vertical
                .flex0.avatar
                  img(src="{link?.img}" alt="Item avatar")
                .flex2
                  h4.document-name {link?.name}
                .flex1
                  h4.document-name {link?.type}
                button.stealth.flex0.pr-sm(on:click!="{() => deleteLink(index)}")
                  i.right.fa.fa-trash.pointer
</template>

<style lang="sass">
  @import '../../styles/Mixins.sass'
  .item-bucket
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
