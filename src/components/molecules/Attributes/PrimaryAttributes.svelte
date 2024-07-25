<script>
import { onMount } from 'svelte';
import AttributeCol from "~/src/components/molecules/Attributes/AttributeCol.svelte";

let data = [
  { code: 'STR', value: "+2" },
  { code: 'DEX', value: "+5" },
  { code: 'VIT', value: "+3" },
  { code: 'INT', value: "+4" },
  { code: 'MND', value: "+3" }
]
</script>
<template lang='pug'>
  .molecule
    .flexrow.header.underscore.mb-md Primary Attributes
    AttributeCol(data="{data}")
</template>
<style lang='sass'>
  @import '../../../styles/Mixins.sass'

  .molecule
    padding: 1em
    @include white-shadow-header
    @include white-shadow-underscore
    
</style>