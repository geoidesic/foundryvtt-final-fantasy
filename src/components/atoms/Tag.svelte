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
  .badge({...$$restProps})
    .label {tag}
    +if("remover")
      .remove.right(on:click!="{() => removeTag(tag)}")
        i.fas.fa-xmark
</template>

<style lang="sass">
  .badge
    display: inline
    border: 2px outset var(--color-highlight-light)
    border-radius: 50px
    background-color: var(--ff-border-color)
    max-height: 1.8rem
    vertical-align: middle
    white-space: nowrap
    &:not(.small)
      padding: 3px 0px 2px 0.4rem
      margin-right: 2px
    &.small
      padding: 0 2px
      margin-right: 2px
      font-size: 0.6rem
      vertical-align: 0%
    &.low
      vertical-align: -10%
    
      .label
        vertical-align: 0%

    .label
      font-size: 0.8rem
      color: white
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
