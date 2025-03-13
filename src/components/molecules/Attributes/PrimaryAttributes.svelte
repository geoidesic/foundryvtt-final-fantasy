<script>
import { onMount } from 'svelte';
import { localize } from '~/src/helpers/util';
import AttributeCol from "~/src/components/molecules/Attributes/AttributeCol.svelte";

export let onclick;

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
    .flexrow.header.underscore.mb-md {localize("Primary")} {localize("Attributes")}
    AttributeCol( key="primary" showSign="{true}" abbreviateLabel="{true}" data="{data}" onclick="{onclick}")
</template>

<style lang='sass'>
  @use '../../../styles/_mixins' as mixins
  
  /* @vite-ignore */
  .molecule
    padding: 1em
    width: 100%
    +mixins.white-shadow-header
    +mixins.white-shadow-underscore
    
</style>