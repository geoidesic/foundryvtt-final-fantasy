<script>
  import { getContext, onDestroy, onMount } from "svelte";
  import { localize } from "~/src/helpers/util";
  import { SYSTEM_ID } from "~/src/helpers/constants";
  import Tag from "../atoms/Tag.svelte";
  
  const doc = getContext("#doc");

  export let availableTags = [];
  export let tagsPath = "system.tags";
  let selectedTag = "";

  $: currentTags = (() => {
    const tags = tagsPath.startsWith('flags') 
      ? ($doc.getFlag(SYSTEM_ID, tagsPath) || [])
      : getProperty($doc, tagsPath) || [];
    return Array.isArray(tags) ? tags : Array.from(tags);
  })();

  $: availableUnselectedTags = availableTags.filter(tag => !currentTags.includes(tag));

  async function addTag() {
    if (!selectedTag) return;
    
    const tags = new Set(currentTags);
    if (tags.has(selectedTag)) {
      ui.notifications.error(localize("Errors.DuplicateTag"));
      selectedTag = "";
      return;
    }

    tags.add(selectedTag);
    const newTags = Array.from(tags);
    
    if (tagsPath.startsWith('flags')) {
      await $doc.setFlag(SYSTEM_ID, tagsPath, newTags);
    } else {
      await $doc.update({ [tagsPath]: newTags });
    }
    selectedTag = "";
  }

  async function removeTag(tagToRemove) {
    const tags = new Set(currentTags);
    tags.delete(tagToRemove);
    const newTags = Array.from(tags);
    
    if (tagsPath.startsWith('flags')) {
      await $doc.setFlag(SYSTEM_ID, tagsPath, newTags);
    } else {
      await $doc.update({ [tagsPath]: newTags });
    }
  }

  onMount(() => {
    if (!currentTags.length) {
      if (tagsPath.startsWith('flags')) {
        $doc.setFlag(SYSTEM_ID, tagsPath, []);
      } else {
        $doc.update({ [tagsPath]: [] });
      }
    }
  });
</script>

<template lang="pug">
.flexcol
  select.tag-select(bind:value="{selectedTag}" on:change="{addTag}")
    option(value="") {localize("EFFECT.Label.SelectTag")}
    +each("availableUnselectedTags as tag")
      option(value="{tag}") {localize(`statusEffects.${tag}.name`)}
.flexrow.gap-4.mt-sm.wrap.justify-vertical
  +each("currentTags as tag")
    .flex0
      Tag({tag} path="{tagsPath}")
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

.wrap
  flex-wrap: wrap
</style> 