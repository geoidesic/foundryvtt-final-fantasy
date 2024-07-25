<script>
  import { onMount } from 'svelte';
  </script>
  <template lang='pug'>
    .molecule
      .flexrow.header Secondary Attributes
      
  </template>
  
  <style lang='sass'>
    @import '../../styles/Mixins.sass'
  
    .molecule
      padding: 1em
      @include white-shadow-header
      @include white-shadow-underscore

  </style>