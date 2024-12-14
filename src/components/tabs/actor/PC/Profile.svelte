<script>
import { onMount } from 'svelte'
import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
import ScrollingContainer from "~/src/helpers/svelte-components/ScrollingContainer.svelte";

const proseMirrorClasses = ['left', 'small']
const proseMirrorClasses2 = ['left']

</script>
<template lang='pug'>
h1.gold Details
.flexrow.justify-vertical
  .flex2 
    label.gold Character Name:
  .flex2.wide
    DocInput.wide(id="name" name="name" valuePath="name")

h1.gold Description
ProseMirror(classes="{proseMirrorClasses}" attr="system.description" )
h1.gold Notes
ProseMirror(classes="{proseMirrorClasses2}" attr="system.biography" )

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
  @import '../../../../styles/Mixins.sass'
</style>
