<script>
import { onMount } from 'svelte';
import PrimaryAttributes from "~/src/components/molecules/Attributes/PrimaryAttributes.svelte";
import SecondaryAttributes from "~/src/components/molecules/Attributes/SecondaryAttributes.svelte";

</script>
<template lang='pug'>
  .molecule.flexrow
    .flex
      PrimaryAttributes
    .flex
      SecondaryAttributes
    
</template>
<style lang='sass'>
  @import '../../../styles/Mixins.sass'

  .molecule
    height: 100%
    width: 100%
    white-space: nowrap
</style>