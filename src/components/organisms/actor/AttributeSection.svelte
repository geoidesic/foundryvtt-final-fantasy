<script>
import { onMount } from 'svelte';
import PortraitFrame from "~/src/components/molecules/PortraitFrame.svelte";
import AttributeBlock from "~/src/components/molecules/Attributes/AttributeBlock.svelte";
import TitleBlock from "~/src/components/molecules/TitleBlock.svelte";
import { ASSET_PATH } from '~/src/helpers/constants';


</script>
<template lang='pug'>
  section.organism
    .flexcol.background
      .texture
      TitleBlock
      .flexrow.panel.borderless
        .flex2
          AttributeBlock
        .flex1.portrait-frame
          PortraitFrame(img="{true}" )
      
</template>
<style lang='sass'>
  @import '../../../styles/Mixins.sass'
  .portrait-frame
    margin-right: -2px
    z-index: 2

  +background
</style>