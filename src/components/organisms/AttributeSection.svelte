<script>
import { onMount } from 'svelte';
import PortraitFrame from "~/src/components/molecules/PortraitFrame.svelte";
import AttributeBlock from "~/src/components/molecules/AttributeBlock.svelte";
import TitleBlock from "~/src/components/molecules/TitleBlock.svelte";

</script>
<template lang='pug'>
  section.organism
    .flexcol
      TitleBlock
      .flexrow
        .flex2
          AttributeBlock
        .flex1
          PortraitFrame
    
</template>
<style lang='sass'>
  @import '../../styles/Mixins.sass'
</style>