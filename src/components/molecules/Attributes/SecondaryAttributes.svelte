<script>
  import { onMount } from 'svelte';
  import AttributeCol from "~/src/components/molecules/Attributes/AttributeCol.svelte";


  let data = [
  { code: 'Defence', value: 14 },
  { code: 'Magic Defence', value: 14 },
  { code: 'Vigilance', value: 13 },
  { code: 'Speed', value: 5 }
]
  </script>
  <template lang='pug'>
    .molecule
      .flexrow.header.underscore.mb-md Secondary Attributes
      AttributeCol(data="{data}")
      
  </template>

  <style lang='sass'>
    @import '../../../styles/Mixins.sass'
  
    .molecule
      padding: 1em
      @include white-shadow-header
      @include white-shadow-underscore

  </style>