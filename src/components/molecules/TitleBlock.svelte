<script>
import { onMount } from 'svelte';
import DocInput from "~/src/components/atoms/controls/DocInput.svelte";

let levelEnabled = false;

</script>
<template lang='pug'>
.panel.heightcol
  .flexrow
    .flex1
      .flexrow.nowrap.justify-vertical(style="min-width: 150px")
        .flex1.right
          label.widebold.font-inter.glow.white.scaleup.mr-lg.inline-block LV
        .flex1.left
          //- input.font-inter(style="font-size: 2em;" name="level" id="level")
          DocInput.widebold.white.wide.font-inter(bind:enabled="{levelEnabled}" type="number" name="level" min=0 valuePath="system.level" textClasses="glow widebold scaleupint white ml-md")

    .flex2
      .flexrow.nowrap.mr-md
        .flex4.job.right
          DocInput.white.wide.widebold( type="text" name="role" valuePath="system.role" textClasses="glow white wide")
        .flex0.middle /
        .flex4.job.left
          DocInput.white.wide.widebold( type="text" name="job" valuePath="system.job" textClasses="glow white wide")

  //- .flexrow.nowrap.font-cinzel
  //-   .flex2.bgb
  //-     div a
  //-   .flex1.bgg
  //-     .middle.white /
  //-   .flex2.bgo
  //-     div a
      
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
    font-family: "Cinzel", serif
    font-size: 2em
    
  .middle
    font-size: 2em
    font-weight: 500
    color: #fff
</style>