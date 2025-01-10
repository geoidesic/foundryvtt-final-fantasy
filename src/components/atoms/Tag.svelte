<script>
  import { getContext } from "svelte";
  import { SYSTEM_ID } from "~/src/helpers/constants";
  import { resolveDotpath } from "~/src/helpers/paths";

  export let tag = "";
  export let remover = true;
  export let path = "system.tags";

  const doc = getContext("#doc");

  async function removeTag(tag) {
    if (remover) {
      if (path.startsWith('flags.')) {
        // Handle flags path
        const flagPath = path.slice(6); // Remove 'flags.' prefix
        const [moduleId, ...rest] = flagPath.split('.');
        const currentTags = $doc.getFlag(moduleId, rest.join('.')) || [];
        const tags = currentTags.filter(t => t !== tag);
        await $doc.setFlag(moduleId, rest.join('.'), tags);
      } else if (path.startsWith('system.')) {
        // Handle system path
        const currentTags = $doc.system.tags || [];
        const tags = currentTags.filter(t => t !== tag);
        await $doc.update({ system: { tags } });
      } else {
        const currentTags = resolveDotpath($doc, path);
        game.system.log.g('currentTags', currentTags);
        const type = Array.isArray(currentTags) ? 'array' : currentTags instanceof Set ? 'set' : 'object';
        game.system.log.g('type', type);
        let tags;
        if (type === 'array') {
          tags = currentTags.filter(t => t !== tag);
          await $doc.update({ [path]: tags });
        } else if (type === 'set') {
          tags = new Set([...currentTags].filter(t => t !== tag));
          game.system.log.g('tags', tags);
          await $doc.update({ [path]: tags });
        } else {
          game.system.log.g('currentTags NOT IMPLEMENTED', currentTags);
        }
      }
    }
  }
  
</script>

<template lang="pug">
  .badge.center({...$$restProps})
    .label {tag}
    if remover
      button.remove.right.stealth(
        on:click="{() => removeTag(tag)}"
        on:keydown="{(e) => e.key === 'Enter' && removeTag(tag)}"
        aria-label="Remove tag"
        tabindex="0"
      )
        i.fas.fa-xmark
</template>

<style lang="sass">
  @use '../../styles/_mixins' as mixins

  .badge
    +mixins.badge


  .label
    margin-right: 0.5rem

  .remove
    cursor: pointer
    padding: 0
    margin: 0
    background: none
    border: none
    color: inherit

    &:hover
      color: #ff4444

  .stealth
    background: none
    border: none
    padding: 0
    margin: 0
</style>
