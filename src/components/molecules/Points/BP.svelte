<script>
  import { onMount, getContext } from 'svelte';
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";

  const actor = getContext("#doc");
  
  onMount(() => {

  });
  </script>
  <template lang='pug'>
    .bp.flexrow.justify-vertical
      .flex3
        .header 
          .header BP
        .sub-header
          .header (Barrier Points)

      .flex2
        .flex.sub-header 
          .header Max
        .flex.max.header 
          .header
            DocInput.wide(clickType="click" pulse="{true}" type="number" name="BP" min=0 valuePath="system.points.BP.max")
      .flex2.left
        .header.val
          .header
            DocInput.wide(clickType="click" pulse="{true}" type="number" name="BP" min=0 max="{$actor.system.points.BP.max}" valuePath="system.points.MP.val")
        
  </template>

  <style lang='sass'>
    @use '../../../styles/_mixins' as mixins
    .bp
      position: relative
      width: 100%
      z-index: 100
    .header
      +mixins.white-shadow-header(var(--size-md-h))
      &.val
        +mixins.white-shadow-header(var(--size-lg-h))
    .sub-header
      +mixins.white-shadow-header(var(--size-sm-h))
  </style>