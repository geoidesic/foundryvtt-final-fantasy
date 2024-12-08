<script>
import { onMount } from 'svelte';
import DocInput from "~/src/components/atoms/controls/DocInput.svelte";

let levelEnabled = false;

</script>
<template lang='pug'>
.flexrow
  .flex1
    .flexrow.nowrap
        +if("!levelEnabled")
          .flex2
            .scaleup.white.ml-30percent(style="min-width: 115px;") LV
        .flex2
          DocInput.white.scaleup.mr-30percent(style="min-width: 115px;" bind:enabled="{levelEnabled}" type="number" name="LV" min=0 valuePath="system.level")
  .flex3
    .flexrow.job.nowrap
      .right
        DocInput(style="max-width: 65px" name="role" min=0 valuePath="system.role") 
      .middle /
      .left
        DocInput(style="max-width: 80px" name="job" min=0 valuePath="system.job")

</template>
<style lang='sass'>
  @import '../../styles/Mixins.sass'
  :global(.FF15 .job input)
    font-size: 1em
  
  .bgr
    background: green


  .bgb
    font-family: "Inter", sans-serif

    background: blue
  .level
    letter-spacing: -2px
    font-family: "Inter", sans-serif
    // font-family: "Montserrat", sans-serif
    color: #fff
    font-weight: 400
    font-size: 8em
    text-shadow: 0 0 4px #fff
    -webkit-text-stroke-width: 0.5px
    -webkit-text-stroke-color: rgba(100,0,0,0.1)

    .right, .left
      display: inline-block
  .job
    white-space: nowrap
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