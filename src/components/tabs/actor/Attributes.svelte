<script>
import { onMount } from 'svelte';
import AttributeSection from "~/src/components/organisms/actor/AttributeSection.svelte";
import PointsSection from "~/src/components/organisms/actor/PointsSection.svelte";
import Favourites from "~/src/components/organisms/actor/Favourites.svelte";

</script>
<template lang='pug'>
  .panel.overflow
    .flexrow
      .flex3
        AttributeSection
        PointsSection
      .flex1
        Favourites
</template>
<style lang='sass'>
  @import '../../../styles/Mixins.sass'
</style>