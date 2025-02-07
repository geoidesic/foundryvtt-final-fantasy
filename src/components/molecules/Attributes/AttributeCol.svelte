<script>
  import { onMount } from "svelte";
  import Attribute from "~/src/components/atoms/actor/Attribute.svelte";

  export let data;
  export let abbreviateLabel = false;
  export let key;
  export let showSign = false;

  export let onclick;


  onMount(() => {});
</script>

<template lang="pug">
  .component
    +each("data as { code }, index")
      Attribute( showSign="{showSign}" abbreviateLabel="{abbreviateLabel}" key="{key}" code="{code}" onclick="{onclick}" )
</template>

<style lang="sass">
  @use '../../../styles/_mixins' as mixins
</style>
