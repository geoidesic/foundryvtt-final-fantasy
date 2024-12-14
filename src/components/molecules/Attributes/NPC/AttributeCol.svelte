<script>
  import { onMount } from "svelte";
  import Attribute from "~/src/components/atoms/actor/Attribute.svelte";

  export let data;
  export let abbreviateLabel;
  export let key;
  export let showSign;


  onMount(() => {});
</script>

<template lang="pug">
  .component
    +each("data as { code }, index")
      Attribute( showSign="{showSign}" abbreviateLabel="{abbreviateLabel}" key="{key}" code="{code}" )
</template>

<style lang="sass">
  @import '../../../../styles/Mixins.sass'
</style>
