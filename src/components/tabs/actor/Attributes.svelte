<script>
import { onMount } from 'svelte';
import AttributeSection from "~/src/components/organisms/actor/AttributeSection.svelte";
import PointsSection from "~/src/components/organisms/actor/PointsSection.svelte";
import Favourites from "~/src/components/organisms/actor/Favourites.svelte";
import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
import PortraitFrame from "~/src/components/molecules/PortraitFrame.svelte";

</script>
<template lang='pug'>
  .panel.overflow.background3
    .flexrow.high
      .flex3
        AttributeSection
        .flexcol.background2.wide
          .texture
          .flexrow.panel.borderless.wide
            .flex2.wide
              .portrait-frame.pr-xs.wide
                PortraitFrame(style="min-width: 182px;")
                  .flexcol.wide
                    .flex1
                      h2.font-cinzel Description
                    .flex1
                      .left.panel.borderless.overflow
                        ProseMirror( editable="{false}" attr="system.description" )
      .flex2
        .flexcol.background3
          .texture
          .flexrow.panel.borderless.wide
            .flex2.wide
              .portrait-frame.pr-xs.wide
                PortraitFrame(style="min-width: 182px;")
                  .flexcol.wide
                    .flex1
                      h2.font-cinzel Points
                    .flex1
                      .left.panel.borderless.overflow
                        PointsSection
        .flexcol.background
          .texture
          .flexrow.panel.borderless.wide
            .flex2
              .portrait-frame.pr-xs
                PortraitFrame(style="min-width: 182px;")
                  Favourites.high.wide
                       

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
  +background4(rgb(76 35 20), 0.05 )
  +background3(rgb(42 20 76), 0.05 )
  +background2(rgb(74 20 76), 0.05 )
  +background(rgb(76 20 32), 0.05 )
  .inset
    +inset(0 0 5px rgba(165,0,0,1) inset)
    width: 100%
  .background, .background2, .background3
    overflow-y: auto
  // +background(rgb(66 76 20), 0.05)
</style>