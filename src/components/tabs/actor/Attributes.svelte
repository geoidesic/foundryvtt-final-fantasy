<script>
import { onMount } from 'svelte';
import AttributeSection from "~/src/components/organisms/actor/AttributeSection.svelte";
import PointsSection from "~/src/components/organisms/actor/PointsSection.svelte";
import Favourites from "~/src/components/organisms/actor/Favourites.svelte";
import PortraitFrame from "~/src/components/molecules/PortraitFrame.svelte";

</script>
<template lang='pug'>
  .panel.overflow
    .flexrow
      .flex3
        AttributeSection
        PointsSection
      .flex2
        .flexcol.background
          .texture
          .flexrow.panel
            .flex2
              .portrait-frame.pr-xs
                PortraitFrame(style="min-width: 350px;")
                  Favourites
</template>
<style lang='sass'>
  @import '../../../styles/Mixins.sass'
  .portrait-frame
    margin-right: -2px
    z-index: 2
  // +background(rgb(29 29 29))
  // +background(rgb(64 47 22), 0.1)
  +background(rgb(20 45 76), 0.05 )
  +background(rgb(48 76 20), 0.05 )
  +background(rgb(20 68 76), 0.05 )
  +background(rgb(76 35 20), 0.05 )
  +background(rgb(42 20 76), 0.05 )
  +background(rgb(74 20 76), 0.05 )
  +background(rgb(76 20 32), 0.05 )
  // +background(rgb(66 76 20), 0.05)
</style>