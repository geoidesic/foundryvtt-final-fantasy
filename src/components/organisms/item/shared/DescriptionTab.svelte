<script>
import { onMount } from 'svelte';
import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";

export let sheet; //- avoid's build errors
sheet; //- avoid's build errors

</script>
<template lang="pug">

.item-sheet.details.overflow.high
  .flexcol.flex3.left.high
      ProseMirror( attr="system.description" )
</template>
<style lang='sass'>
  @use '../../../../styles/_mixins' as mixins

  .details
    height: calc(100% - 0px)

    +mixins.inset

</style>