<script>
  import { onMount, getContext } from 'svelte';
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";

  const actor = getContext("#doc");
  
  onMount(() => {
    game.system.log.d("BP mounted");
    game.system.log.d($actor);

  });
  </script>
  <template lang='pug'>
    .bp.flexrow.justify-flexrow-vertical 
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
        .header
          DocInput(type="number" name="BP" min=0 max="{$actor.system.points.BP.max}" valuePath="system.points.BP.val")
      
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