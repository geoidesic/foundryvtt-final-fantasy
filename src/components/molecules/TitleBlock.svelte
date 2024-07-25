<script>
import { onMount } from 'svelte';
</script>
<template lang='pug'>
  .component 
    .row
      .level LV50 
      .job DPS/BARD
    
</template>
<style lang='sass'>
  @import '../../styles/Mixins.sass'
  .row
    border: 5px ridge var(--border-color)
    padding: 1rem
  .level
    display: inline-block
    transform: scaleX(4)
    margin: 2px 5em 0 0
    transform-origin: left
    font-family: "Bebas Neue", sans-serif
    // font-family: "Montserrat", sans-serif
    color: #fff
    font-weight: 400
    font-size: 2em
    text-shadow: 0 0 3px #fff
  .job
    display: inline-block
    transform: scaleX(1)
    transform-origin: left
    font-family: "Cinzel", serif
    font-size: 2em
    font-weight: 700
    color: #fff
</style>