<script>
  import { onMount } from 'svelte';
  import AttributeCol from "~/src/components/molecules/Attributes/AttributeCol.svelte";


  let data = [
  { code: 'def' },
  { code: 'mag' },
  { code: 'vig' },
  { code: 'spd' }
]
  </script>
  <template lang='pug'>
    .molecule
      .flexrow.header.underscore.mb-md Secondary Attributes
      AttributeCol(data="{data}" key="secondary")
      
  </template>

  <style lang='sass'>
    @import '../../../styles/Mixins.sass'
  
    .molecule
      padding: 1em
      @include white-shadow-header
      @include white-shadow-underscore

  </style>