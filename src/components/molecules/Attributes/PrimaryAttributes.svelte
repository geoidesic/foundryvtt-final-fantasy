<script>
import { onMount } from 'svelte';
import AttributeCol from "~/src/components/molecules/Attributes/AttributeCol.svelte";

let data = [
  { code: 'str', value: "+2" },
  { code: 'dex', value: "+5" },
  { code: 'vit', value: "+3" },
  { code: 'int', value: "+4" },
  { code: 'mnd', value: "+3" }
]
</script>
<template lang='pug'>
  .molecule
    .flexrow.header.underscore.mb-md Primary Attributes
    AttributeCol(uppercase="{true}" data="{data}")
</template>
<style lang='sass'>
  @import '../../../styles/Mixins.sass'

  .molecule
    padding: 1em
    @include white-shadow-header
    @include white-shadow-underscore
    
</style>