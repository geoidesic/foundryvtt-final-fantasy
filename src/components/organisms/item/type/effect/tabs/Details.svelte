<script>
  import { onMount, getContext } from "svelte";
  import DurationComponent from "~/src/components/molecules/Item/Duration.svelte";
  

</script>

<template lang="pug">
.item-sheet.details.overflow
  DurationComponent
</template>

<style lang="sass">
    @use '../../../../../../styles/_mixins' as mixins

    .details
      max-height: calc(100% - 15px) //- prevents the scrolling area's content from being hidden below the fold
      +mixins.inset(1rem)
</style>
