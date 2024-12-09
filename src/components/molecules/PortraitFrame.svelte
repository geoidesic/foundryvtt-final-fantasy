<script>
import { onMount } from 'svelte';
import { ASSET_PATH } from '~/src/helpers/constants';
import Corner from '~/src/components/atoms/PortraitFrame/corner.svelte';

export let img = false;
export let strokeColor="#514030";

onMount(() => {
  game.system.log.d('PortraitFrame mounted');
});
</script>
<template lang="pug">
.atom
  .frame({...$$restProps})
    +if("img")
      img(src="{ASSET_PATH}/portraits/witch2.webp" alt="witch avatar")
      +else
        slot
    Corner.corner.bottom-right(strokeColor="{strokeColor}" size="50")
    Corner.corner.bottom-left( flip="horizontal" strokeColor="{strokeColor}" size="50")
    Corner.corner.top-right(flip="vertical" strokeColor="{strokeColor}" size="50")
    Corner.corner.top-left( flip="both" strokeColor="{strokeColor}" size="50")
</template>

<style lang='sass'>
  @import '../../styles/Mixins.sass'

  .frame
    position: relative
    display: flex
    min-width: 100px
    min-height: 100px
    border: 3px solid var(--ff-border-color) // Matching CSS border
    
    border-radius: 17px
    padding: 0px // Adjust based on SVG size


  :global(.corner)
    position: absolute
    border: none
    color: var(--ff-border-color)
    pointer-events: none


  :global(.corner.top-left)
    top: -5px
    left: -5px

  :global(.corner.top-right)
    top: -5px
    right: -5px

  :global(.corner.bottom-left)
    bottom: -5px
    left: -5px

  :global(.corner.bottom-right)
    bottom: -5px
    right: -5px
</style>