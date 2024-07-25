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
    margin: 2px 5em 0 0
    transform: scaleX(2.4)
    letter-spacing: -2px
    transform-origin: left
    font-family: "Inter", sans-serif
    // font-family: "Montserrat", sans-serif
    color: #fff
    font-weight: 400
    font-size: 2em
    text-shadow: 0 0 4px #fff
    -webkit-text-stroke-width: 0.5px
    -webkit-text-stroke-color: rgba(100,0,0,0.1)
  .job
    display: inline-block
    transform: scaleX(1.2)
    transform-origin: left
    font-family: "Cinzel", serif
    font-size: 2em
    font-weight: 500
    color: #fff
</style>