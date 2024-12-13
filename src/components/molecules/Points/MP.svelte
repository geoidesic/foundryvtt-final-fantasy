<script>
  import { onMount, getContext } from 'svelte';
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";

  const actor = getContext("#doc");
  
  onMount(() => {

  });
  </script>
  <template lang='pug'>
    .mp.flexrow.justify-vertical
      .flex3
        .header 
          .header MP
        .sub-header
          .header (Magic Points)

      .flex2
        .flex.sub-header 
          .header Max
        .flex.max.header 
          .header
            DocInput.wide(clickType="click" pulse="{true}" type="number" name="MP" min=0 valuePath="system.points.MP.max")
      .flex2.left
        .header.val
          .header
            DocInput.wide(clickType="click" pulse="{true}" type="number" name="MP" min=0 max="{$actor.system.points.MP.max}" valuePath="system.points.MP.val")
        
  </template>

  <style lang='sass'>
    @import '../../../styles/Mixins.sass'
    .mp
      position: relative
      width: 100%
      z-index: 100
    .header
      @include white-shadow-header(var(--size-md-h))
      &.val
        @include white-shadow-header(var(--size-lg-h))
    .sub-header
      @include white-shadow-header(var(--size-sm-h))
  </style>