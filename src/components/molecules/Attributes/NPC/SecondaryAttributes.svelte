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
      .flexrow.mb-md 
        AttributeCol(data="{data}" key="secondary" onclick="{onclick}")
      
  </template>

  <style lang='sass'>
    @use '../../../../styles/_mixins' as mixins
  
    .molecule
      width: 100%
      padding: 1em

  </style>