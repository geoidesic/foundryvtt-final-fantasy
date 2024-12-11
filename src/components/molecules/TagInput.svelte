<script>
  import { getContext, onDestroy, onMount } from "svelte";
  import { Timing } from "@typhonjs-fvtt/runtime/util";
  import { localize } from "#runtime/svelte/helper";
  import { SYSTEM_CODE } from "~/src/helpers/constants";

  const doc = getContext("#doc");

  let newTag = "";
  const addTagDebounce = Timing.debounce(addTag, 600);

  async function addTag() {
    const tags = [...$doc.system.tags];
    
    // Check for duplicate tag
    if (tags.includes(newTag)) {
      ui.notifications.error(localize(`${SYSTEM_CODE}.Errors.DuplicateTag`));
      newTag = ""; // Clear the input if the tag already exists
      return; // Exit the function to prevent adding the duplicate tag
    }
    if (!newTag.length) {
      return; // Exit the function to prevent adding the duplicate tag
    }

    tags.push(newTag);
    await $doc.update({ system: { tags } });
    newTag = "";
  }
  function removeTag(tag) {
    const tags = [...$doc.system.tags];
    const index = tags.indexOf(tag);
    if (index !== -1) {
      tags.splice(index, 1);
      $doc.update({ system: { tags } });
    }
  }
  $: newTag = newTag.toLowerCase().trim();

  onMount(() => {
  });
  onDestroy(() => {
  });
</script>

<template lang="pug">
.flexcol
  input(bind:value="{newTag}" on:input="{addTagDebounce}" placeholder="Enter new tag")
.flexrow.gap-4.mt-sm.justify-vertical
  +each("$doc.system.tags as tag")
    .flex0
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
