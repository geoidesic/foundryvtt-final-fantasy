<script>
import { onMount } from 'svelte';
import { ASSET_PATH } from '~/src/helpers/constants';

import Corner from '~/src/components/atoms/PortraitFrame/corner.svelte';

let strokeColor="#514030";

onMount(() => {
  log.d('PortraitFrame mounted');
});
</script>
<template lang="pug">
.atom
  .frame
    img(src="{ASSET_PATH}/portraits/witch2.webp")
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
    border: 3px solid var(--border-color) // Matching CSS border
    box-shadow: inset 0 0 30px 30px var(--border-shadow)

    border-radius: 17px
    padding: 0px // Adjust based on SVG size

  :global(.corner)
    position: absolute
    border: none
    color: var(--border-color)


  :global(.top-left)
    top: -5px
    left: -5px

  :global(.top-right)
    top: -5px
    right: -5px

  :global(.bottom-left)
    bottom: -5px
    left: -5px

  :global(.bottom-right)
    bottom: -5px
    right: -5px
</style>