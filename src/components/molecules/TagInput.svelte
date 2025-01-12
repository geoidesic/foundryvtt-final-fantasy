<script>
  import { getContext, onDestroy, onMount } from "svelte";
  import { Timing } from "#runtime/util";
  import { localize } from "#runtime/util/i18n";
  import { SYSTEM_CODE } from "~/src/helpers/constants";
  import Tag from "../atoms/Tag.svelte";
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
      Tag.badge.round({tag})
</template>

