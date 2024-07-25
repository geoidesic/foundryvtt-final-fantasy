<script>
  export let size = 50;
</script>

<template lang="pug">
  svg({...$$props} style="--size: {size}px" xmlns="http://www.w3.org/2000/svg")
    path(d="M0 50 L50 50 L50 0 Z")
    path(d="M50 50 L25 25 L50 0")
    circle(cx="38" cy="38" r="5")
</template>


<style lang="sass">
  @import '../../../styles/Mixins.sass'
  @include cornice
</style>


