<script>
import { onMount } from 'svelte';
import AttributeCol from "~/src/components/molecules/Attributes/AttributeCol.svelte";

let data = [
  { code: 'str' },
  { code: 'dex' },
  { code: 'vit' },
  { code: 'int' },
  { code: 'mnd' }
]
</script>
<template lang='pug'>
  .molecule
    .flexrow.header.underscore.mb-md Primary Attributes
    AttributeCol( key="primary" showSign="{true}" abbreviateLabel="{true}" data="{data}")
</template>
<style lang='sass'>
  @import '../../../styles/Mixins.sass'

  .molecule
    padding: 1em
    @include white-shadow-header
    @include white-shadow-underscore
    
</style>