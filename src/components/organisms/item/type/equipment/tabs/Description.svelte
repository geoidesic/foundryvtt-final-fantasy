<script>
import { onMount } from 'svelte';
import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
</script>
<template lang="pug">
  .item-tabs
    .flexcol.flex3.left.prose.inset
      ProseMirror( attr="system.description" )
</template>
<style lang='sass'>
  @import '../../../../../../styles/Mixins.sass'
  .item-tabs
    @include inset
</style>