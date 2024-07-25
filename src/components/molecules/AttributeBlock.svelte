<script>
import { onMount } from 'svelte';
import PortraitFrame from "~/src/components/molecules/PortraitFrame.svelte";
import PrimaryAttributes from "~/src/components/molecules/PrimaryAttributes.svelte";
import SecondaryAttributes from "~/src/components/molecules/SecondaryAttributes.svelte";

</script>
<template lang='pug'>
  .molecule.flexrow
    .flex
      PrimaryAttributes
    .flex
      SecondaryAttributes
    
</template>
<style lang='sass'>
  @import '../../styles/Mixins.sass'
</style>