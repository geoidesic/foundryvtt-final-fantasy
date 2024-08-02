<script>
import { onMount } from 'svelte';
import Attribute from "~/src/components/atoms/actor/Attribute.svelte";

export let data;
export let uppercase = false;

onMount(() => {
});
</script>
<template lang='pug'>
  .component
    +each("data as { code, value }, index")
      Attribute(uppercase="{uppercase}" code="{code}" value="{value}")  
</template>
<style lang='sass'>
  @import '../../../styles/Mixins.sass'
</style>