<script>
  import { getContext } from "svelte";

  export let tag = ""

  const doc = getContext("#doc");

  function removeTag(tag) {
    const tags = [...$doc.system.tags];
    const index = tags.indexOf(tag);
    if (index !== -1) {
      tags.splice(index, 1);
      $doc.update({ system: { tags } });
    }
  }

</script>

<template lang="pug">
  .badge
    .label {tag}
    .remove.right(on:click!="{() => removeTag(tag)}")
      i.fas.fa-xmark
</template>


<style lang="sass">
  .badge
    display: inline
    border: 2px outset var(--color-highlight-light)
    border-radius: 50px
    background-color: var(--ff-border-color)
    padding: 3px 0px 2px 0.4rem
    margin-right: 2px
    max-height: 1.8rem
    vertical-align: middle
    white-space: nowrap
    
    .label
      font-size: 0.8rem
      color: white
      vertical-align: 10%
      display: inline-block
    .remove
      display: inline-block
      margin-left: 4px
      padding: 2px 4px 0 4px
      background-color: rgba(255, 255, 255, 0.3)
      border-radius: 10px
      border: 1px solid transparent
      color: white
      cursor: pointer
      transition: background-color 0.3s ease, color 0.3s ease
      &:hover
        color: var(--color-shadow-primary)
        background-color: rgba(255, 255, 255, 1)
</style>
