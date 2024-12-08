<script>
import { onMount } from 'svelte'
import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
import ScrollingContainer from "~/src/helpers/svelte-components/ScrollingContainer.svelte";

</script>
<template lang='pug'>
h1 Details
.flexrow.justify-vertical
  .flex2 
    label Character Name:
  .flex2
    DocInput(id="name" name="name" valuePath="name")
h1 Notes
.left.panel.borderless
  ProseMirror( attr="system.biography" )

//- .panel.heightcol
//-   .flexrow
//-     h1 Details
//-   .flexrow
//-     .flex2.left
//-       label Character Name:
//-     .flex2.right
//-       DocInput(id="name" name="name" valuePath="name")
//-   hr
//-   .flexcol
//-     .flex0
//-       .flexrow
//-         h1 Notes

//-   .flexrow.left.heightcol
//-     ProseMirror( attr="system.biography" )

</template>
<style lang='sass'>
  @import '../../../styles/Mixins.sass'
</style>
