<script>
import { onMount } from 'svelte';
</script>
<template lang='pug'>
  .molecule
    .flexrow.header Primary Attributes
    
</template>
<style lang='sass'>
  @import '../../styles/Mixins.sass'

  .molecule
    padding: 1em
    @include white-shadow-header
    @include white-shadow-underscore
</style>