<script>
import { onMount } from 'svelte';
import DocInput from "~/src/components/atoms/controls/DocInput.svelte";

</script>
<template lang='pug'>
.flexrow
  .flex2
    .flexrow.level
      .right LV
      .left
        DocInput(style="max-width: 40px" type="number" name="LV" min=0 valuePath="system.level")
  .flex2
    .flexrow.job
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
  .level
    display: inline-block
    margin: 2px 5em 0 0
    transform: scaleX(2.4)
    letter-spacing: -2px
    transform-origin: left
    font-family: "Inter", sans-serif
    // font-family: "Montserrat", sans-serif
    color: #fff
    font-weight: 400
    font-size: 2em
    text-shadow: 0 0 4px #fff
    -webkit-text-stroke-width: 0.5px
    -webkit-text-stroke-color: rgba(100,0,0,0.1)

    .right, .left
      display: inline-block
  .job
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