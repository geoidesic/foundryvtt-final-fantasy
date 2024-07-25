<script>
  export let size = 50;
  export let strokeWidth = 2;
</script>

<template lang="pug">
  svg({...$$props} style="--size: {size}px; --stroke-width: {strokeWidth}px" xmlns="http://www.w3.org/2000/svg")
    path(d="M0 0 L0 50 L50 50 Z")
    path(d="M0 50 L25 25 L50 50")
    circle(cx="12" cy="38" r="5")
</template>


<style lang="sass">
  @import '../../../styles/Mixins.sass'
  @include cornice
</style>


