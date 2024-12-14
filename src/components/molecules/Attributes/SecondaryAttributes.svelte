<script>
  import { onMount } from 'svelte';
  import AttributeCol from "~/src/components/molecules/Attributes/AttributeCol.svelte";

  export let onclick;

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
      AttributeCol(data="{data}" key="secondary" onclick="{onclick}")
      
  </template>

  <style lang='sass'>
    @import '../../../styles/Mixins.sass'
  
    .molecule
      width: 100%
      padding: 1em
      @include white-shadow-header
      @include white-shadow-underscore

  </style>