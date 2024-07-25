<script>
  import { onMount, getContext } from 'svelte';
  
  const actor = getContext("#doc");
  
  onMount(() => {
    console.log("HP mounted");
    console.log($actor);
  });
  </script>
  <template lang='pug'>
    .hp.flexrow.justify-flexrow-vertical 
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
      .flex.header
        .header.val {$actor.system.points.MP.val}
      
  </template>
  <style lang='sass'>
    @import '../../../styles/Mixins.sass'
    
    .header
      @include white-shadow-header(var(--size-md-h))
    .sub-header
      @include white-shadow-header(var(--size-sm-h))
  </style>