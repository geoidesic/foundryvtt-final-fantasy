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
  +if("remover")
    div.remove.right(
      on:click!="{() => removeTag(tag)}"
      aria-label="Remove tag"
      role="button"
    )
      i.fas.fa-xmark
</template>

<style lang="sass">
  @use '../../styles/_mixins' as mixins

  .badge
    display: inline-flex
    line-height: 1.5rem
    padding: 2px 0px 0 5px
    +mixins.badge(var(--ff-border-color),#ffffff,  0.9rem, 0, transparent)
    

  .round
    border-radius: 1000px

  .square
    border-radius: var(--border-radius)


  .remove
    cursor: pointer
    padding: 4px 5px 0 5px
    margin: -1px 0 0 3px
    background: none
    color: inherit
    border: 1px solid transparent
    border-radius: 50%
    line-height: 1rem
    vertical-align: middle

    &:hover
      background: #ffffff
      color: var(--ff-border-color)
  .stealth
    background: none
    border: none
    padding: 0
    margin: 0
</style>
