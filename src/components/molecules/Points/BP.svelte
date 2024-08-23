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
            .header BP
          .sub-header
            .header (Barrier)
          
      .flex
        .flexcol
          .flex.sub-header 
            .header Max
          .flex.max.header 
            .header {$actor.system.points.BP.max}
      .flex.header.val
        .header {$actor.system.points.BP.val}
      
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