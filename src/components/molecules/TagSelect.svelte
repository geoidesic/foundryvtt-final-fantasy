<script>
  import { getContext, onDestroy, onMount } from "svelte";
  import { localize } from "#runtime/svelte/helper";
  import { SYSTEM_CODE } from "~/src/helpers/constants";
  import Tag from "../atoms/Tag.svelte";
  
  const doc = getContext("#doc");

  export let availableTags = [];
  let selectedTag = "";

  async function addTag() {
    const tags = [...$doc.system.tags];
    
    // Check for duplicate tag
    if (tags.includes(selectedTag)) {
      ui.notifications.error(localize(`${SYSTEM_CODE}.Errors.DuplicateTag`));
      selectedTag = ""; // Clear the selection if the tag already exists
      return;
    }
    if (!selectedTag.length) {
      return;
    }

    tags.push(selectedTag);
    await $doc.update({ system: { tags } });
    selectedTag = "";
  }

  onMount(() => {
    // Initialize tags array if it doesn't exist
    if (!$doc.system.tags) {
      $doc.update({ system: { tags: [] } });
    }
  });
</script>

<template lang="pug">
.flexcol
  select.tag-select(bind:value="{selectedTag}" on:change="{addTag}")
    option(value="") {localize(`${SYSTEM_CODE}.Labels.SelectTag`)}
    +each("availableTags as tag")
      option(value="{tag}") {tag}
.flexrow.gap-4.mt-sm.justify-vertical
  +each("$doc.system.tags as tag")
    .flex0
      Tag({tag})
</template>

<style lang="sass">
.tag-select
  background: var(--color-background)
  color: var(--color-text)
  border: 1px solid var(--color-border)
  border-radius: 3px
  padding: 4px
  width: 100%
  &:focus
    outline: none
    box-shadow: 0 0 0 1px var(--color-border-highlight)
</style> 