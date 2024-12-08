<script>
import { onMount } from 'svelte';
import AttributeSection from "~/src/components/organisms/actor/AttributeSection.svelte";
import PointsSection from "~/src/components/organisms/actor/PointsSection.svelte";

</script>
<template lang='pug'>
  .panel
    AttributeSection
    PointsSection
</template>
<style lang='sass'>
  @import '../../../styles/Mixins.sass'
</style>