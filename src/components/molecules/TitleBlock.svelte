<script>
import { onMount } from 'svelte';
import DocInput from "~/src/components/atoms/controls/DocInput.svelte";

let levelEnabled = false;

</script>
<template lang='pug'>
.panel.heightcol
  .flexrow.nowrap.justify-vertical
    .flex1.right
      label.right
        span.widebold.font-inter.glow.white.scaleup.mr-lg.inline-block LV
    .flex1.left
      //- input.font-inter(style="font-size: 2em;" name="level" id="level")
      DocInput.widebold.white.wide.font-inter(bind:enabled="{levelEnabled}" type="number" name="LV" min=0 valuePath="system.level" textClasses="glow widebold scaleupint white ml-md")
//- .flexrow
//-   .flex2
//-     .flexrow.nowrap
//-       .flex2.bgg 
//-         span.scaleup LV
//-       .flex2.bgb
//-         DocInput.white.scaleup(bind:enabled="{levelEnabled}" type="number" name="LV" min=0 valuePath="system.level" textClasses="scaleup")
//-   .flex2
//-     .flexrow.job
//-       .right
//-         DocInput(style="max-width: 65px" name="role" min=0 valuePath="system.role") 
//-       .middle /
//-       .left
//-         DocInput(style="max-width: 80px" name="job" min=0 valuePath="system.job")

</template>
<style lang='sass'>
  @import '../../styles/Mixins.sass'
  :global(.FF15 .job input)
    font-size: 1em

  .job
    white-space: nowrap
    display: inline-block
    margin: 2px 5em 0 0
    transform: scaleX(1.2)
    letter-spacing: -2px
    transform-origin: left
    font-family: "Cinzel", serif
    // font-family: "Montserrat", sans-serif
    color: #fff
    font-weight: 400
    font-size: 2em
    text-shadow: 0 0 4px #fff
    -webkit-text-stroke-width: 0.5px
    -webkit-text-stroke-color: rgba(100,0,0,0.1)

    .right, .left
      display: inline-block
      
  .middle
    display: inline-block
    margin: 0 0.25em

    transform: scaleX(1.2)
    transform-origin: left
    font-family: "Cinzel", serif
    font-size: 1em
    font-weight: 500
    color: #fff
</style>