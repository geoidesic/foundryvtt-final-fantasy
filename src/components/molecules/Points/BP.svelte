<script>
  import { onMount, getContext } from 'svelte';
  import { localize } from '~/src/helpers/util';
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";

  const actor = getContext("#doc");
  
  onMount(() => {

  });
  </script>
  <template lang='pug'>
    .bp.flexrow.justify-vertical
      .flex3
        .header 
          .header {localize("Types.Actor.Points.BP.short")}
        .sub-header
          .header {localize("Types.Actor.Points.BP.Label")}

      .flex2.left
        .header.val
          .header
            DocInput.wide(clickType="click" pulse="{true}" type="number" name="BP" min=0 max="{$actor.system.points.BP.max}" valuePath="system.points.BP.val")
        
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