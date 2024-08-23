<script>
  import { onMount, getContext } from 'svelte';
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
  
  const actor = getContext("#doc");
  
  onMount(() => {
    console.log("HP mounted");
    console.log($actor);
  });
  </script>
  <template lang='pug'>
    .mp.flexrow.justify-flexrow-vertical 
      .flex
        .flexcol
          .header 
            .header MP
          .sub-header
            .header (Mana)
      .flex
        .flexcol
          .flex.sub-header 
            .header Max
          .flex.max.header 
            .header {$actor.system.points.MP.max}
      .flex.header.val
        .header 
          DocInput(name="BP" type="number" valuePath="system.points.MP.val" min=0 max="{$actor.system.points.MP.max}" )
      
  </template>

  <style lang='sass'>
    @import '../../../styles/Mixins.sass'
    
    .header
      @include white-shadow-header(var(--size-md-h))
      &.val
        @include white-shadow-header(var(--size-lg-h))
    .sub-header
      @include white-shadow-header(var(--size-sm-h))
  </style>