<script>
  import { onMount, getContext } from 'svelte';
  import { localize } from "~/src/helpers/util";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";

  const actor = getContext("#doc");
  
  onMount(() => {

  });
  </script>
  <template lang='pug'>
    .mp.flexrow.justify-vertical
      .flex3
        .header 
          .header {localize("Types.Actor.Points.MP.short")}
        .sub-header
          .header {localize("Types.Actor.Points.MP.Label")}

      .flex2
        .flex.sub-header 
          .header {localize("Max")}
        .flex.max.header 
          .header
            DocInput.wide(clickType="click" pulse="{true}" type="number" name="MP" min=0 valuePath="system.points.MP.max")
      .flex2.left
        .header.val
          .header
            DocInput.wide(clickType="click" pulse="{true}" type="number" name="MP" min=0 max="{$actor.system.points.MP.max}" valuePath="system.points.MP.val")
        
  </template>

  <style lang='sass'>
    @use '../../../styles/_mixins' as mixins
    .mp
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