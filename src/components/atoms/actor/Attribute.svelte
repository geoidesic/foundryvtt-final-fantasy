<script>
import { onMount } from 'svelte';

export let code;
export let value;
export let uppercase = false;

onMount(() => {
});

</script>
<template lang='pug'>
  .component
    .underscore.flexrow
      .flex2.header {uppercase ? code.toUpperCase() : code} 
      .flex0.header {value}
    
</template>
<style lang='sass'>
  @import '../../../styles/Mixins.sass'
  .component
    @include white-shadow-header(var(--size-md))
    margin-bottom: 1em
    transform: scaleY(1.5)
    transform-origin: top

    @include white-shadow-underscore(3.5px, rgba(255, 255, 255, 0.4), rgba(0,0,0,0.3), 0px, 0.1em, -3px, 103%, 0px)

</style>