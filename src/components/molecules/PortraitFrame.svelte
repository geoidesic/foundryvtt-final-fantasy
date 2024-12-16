<script>
import { onMount } from 'svelte';
import { ASSET_PATH } from '~/src/helpers/constants';
import Corner from '~/src/components/atoms/PortraitFrame/corner.svelte';

export let img = false;
export let imgSrc = `${ASSET_PATH}/portraits/witch2.webp`;
export let strokeColor="#514030";
export let onClick;
export let size = 50;

onMount(() => {
});
</script>
<template lang="pug">
.atom(class="{$$restProps?.class?.includes('high') ? 'high' : ''}")
  .frame({...$$restProps})
    +if("img")
      img(src="{imgSrc}" alt="avatar" on:click="{onClick}")
      +else
        slot
    Corner.corner.bottom-right(strokeColor="{strokeColor}" size="{size}")
    Corner.corner.bottom-left( flip="horizontal" strokeColor="{strokeColor}" size="{size}")
    Corner.corner.top-right(flip="vertical" strokeColor="{strokeColor}" size="{size}")
    Corner.corner.top-left( flip="both" strokeColor="{strokeColor}" size="{size}")
</template>

<style lang='sass'>
  @import '../../styles/Mixins.sass'

  .frame
    position: relative
    display: flex
    border: 3px solid var(--ff-border-color) // Matching CSS border
    border-radius: 17px
    padding: 0px // Adjust based on SVG size
    :not(.narrow)
      min-width: 100px
      min-height: 100px


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