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
      .flexrow.header.underscore.mb-md {localize("Secondary")} {localize("Attributes")}
      AttributeCol(key="secondary" data="{data}" onclick="{onclick}")
      
  </template>

  <style lang='sass'>
    @use '../../../styles/_mixins' as mixins
  
    .molecule
      width: 100%
      padding: 1em
      +mixins.white-shadow-header
      +mixins.white-shadow-underscore

  </style>