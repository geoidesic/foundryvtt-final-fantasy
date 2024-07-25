<script>
  export let size = 50;
</script>

<template lang="pug">
  svg({...$$props} style="--size: {size}px" xmlns="http://www.w3.org/2000/svg")
    path(d="M0 0 L50 0 L0 50 Z")
    path(d="M0 0 L25 25 L0 50")
    circle(cx="12" cy="12" r="5")
</template>


<style lang="sass">
  @import '../../../styles/Mixins.sass'
  @include cornice
</style>
