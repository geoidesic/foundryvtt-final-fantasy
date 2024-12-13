<script>
  import { onMount, getContext } from 'svelte';
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";

  const actor = getContext("#doc");
  
  onMount(() => {

  });
  </script>
  <template lang='pug'>
    .hp.flexrow.justify-vertical
      .flex3
        .header 
          .header HP
        .sub-header
          .header (Hit Points)

      .flex2
        .flex.sub-header 
          .header Max
        .flex.max.header 
          .header
            DocInput.wide(clickType="click" pulse="{true}" type="number" name="HP" min=0 valuePath="system.points.HP.max")
      .flex2.left
        .header.val
          .header
            DocInput.wide(clickType="click" pulse="{true}" type="number" name="HP" min=0 max="{$actor.system.points.HP.max}" valuePath="system.points.HP.val")
        
  </template>

  <style lang='sass'>
    @import '../../../styles/Mixins.sass'
    .hp
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