<script>
import { onMount } from 'svelte';
import PortraitFrame from "~/src/components/molecules/PortraitFrame.svelte";
import AttributeBlock from "~/src/components/molecules/Attributes/AttributeBlock.svelte";
import TitleBlock from "~/src/components/molecules/TitleBlock.svelte";

</script>
<template lang='pug'>
  section.organism
    .flexcol.background
      .texture
      TitleBlock
      .flexrow
        .flex2
          AttributeBlock
        .flex1(style="margin-right: -2px; z-index: 2")
          PortraitFrame
      
</template>
<style lang='sass'>
  @import '../../styles/Mixins.sass'

  .background
    width: 100%
    background-color: rgb(154 48 53)
    position: relative
    overflow: hidden
    border: 4px ridge var(--border-color)

    .texture
      position: absolute
      top: 0
      left: 0
      width: 100%
      height: 100%
      background-image: url("systems/foundryvtt-final-fantasy/assets/diamonds.png")
      // background-image: url("systems/foundryvtt-final-fantasy/assets/royal-tile.png")
      background-size: 40%
      background-repeat: repeat
      opacity: 0.05
      z-index: 1
</style>