<script>
import { onMount } from 'svelte';
import AttributeSection from "~/src/components/organisms/AttributeSection.svelte";
import PointsSection from "~/src/components/organisms/PointsSection.svelte";

</script>
<template lang='pug'>
  .component
    AttributeSection
    PointsSection
</template>
<style lang='sass'>
  @import '../../../styles/Mixins.sass'
</style>