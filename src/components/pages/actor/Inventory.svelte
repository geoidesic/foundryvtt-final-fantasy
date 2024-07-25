<script>
import { onMount } from 'svelte';
import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
import ScrollingContainer from "~/src/helpers/svelte-components/ScrollingContainer.svelte";

</script>
<template lang='pug'>
ScrollingContainer
  .flexcol.background

</template>
<style lang='sass'>
  @import '../../../styles/Mixins.sass'
  .background
    text-align: left
    min-height: 100%
    width: 100%
    position: relative
    overflow: hidden
    border: 4px ridge var(--border-color)
</style>