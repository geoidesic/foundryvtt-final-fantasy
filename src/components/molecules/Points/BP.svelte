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
    .bp.flexrow.justify-vertical
      .flex3
        .header 
          .header BP
        .sub-header
          .header (Barrier)

      .flex2
        .flex.sub-header 
          .header Max
        .flex.max.header 
          .header
            DocInput(clickType="click" pulse="{true}" type="number" name="BP" min=0 valuePath="system.points.BP.max")
      .flex2.left
        .header.val
          .header
            DocInput(clickType="click" pulse="{true}" type="number" name="BP" min=0 max="{$actor.system.points.BP.max}" valuePath="system.points.BP.val")
        
  </template>

  <style lang='sass'>
    @import '../../../styles/Mixins.sass'
    .bp
      width: 100%
    .header
      @include white-shadow-header(var(--size-md-h))
      &.val
        @include white-shadow-header(var(--size-lg-h))
    .sub-header
      @include white-shadow-header(var(--size-sm-h))
  </style>