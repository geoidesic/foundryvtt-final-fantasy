<script>
  import { onMount, getContext } from "svelte";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";

  const actor = getContext("#doc");

  onMount(() => {
    console.log("HP mounted");
    console.log($actor);
  });
</script>

<template lang="pug">
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
            DocInput(clickType="dblclick" pulse="{true}" type="number" name="BP" min=0 valuePath="system.points.HP.max")

      .flex2
        .header.val
          .header 
            DocInput(clickType="dblclick" pulse="{true}" type="number" name="BP" valuePath="system.points.HP.val" min=0 max="{$actor.system.points.HP.max}" )


</template>

<style lang="sass">
    @import '../../../styles/Mixins.sass'
    .hp
      width: 100%
    .header
      @include white-shadow-header(var(--size-md-h))
      &.val
        @include white-shadow-header(var(--size-lg-h))
    .sub-header
      @include white-shadow-header(var(--size-sm-h))
</style>
