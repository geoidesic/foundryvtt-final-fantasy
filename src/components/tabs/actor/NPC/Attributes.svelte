<script>
  import { onMount, getContext } from "svelte";
  import { SYSTEM_CODE } from "~/src/helpers/constants";
  import { localize } from "#runtime/svelte/helper";
  import AttributeSection from "~/src/components/organisms/actor/NPC/AttributeSection.svelte";
  import PointsSection from "~/src/components/organisms/actor/PointsSectionNPC.svelte";
  import EffectsSection from "~/src/components/organisms/actor/EffectsSection.svelte";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import PortraitFrame from "~/src/components/molecules/PortraitFrame.svelte";
  import Portrait from "~/src/components/organisms/actor/Portrait.svelte";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";

  const documentStore = getContext("#doc");
</script>

<template lang="pug">
  .panel.overflow
    .flexrow.high
      .flex2
        .flexcol.purple
          .background
            .texture
            .flexrow.panel.borderless.wide
              .flex1
                Portrait
              .flex2.wide
                .portrait-frame.pr-xs.wide
                  PortraitFrame(style="min-width: 182px;")
                    .flexcol.wide
                      .flex1
                        h2.font-cinzel {localize(`${SYSTEM_CODE}.Points`)}
                      .flex1
                        .left.panel.borderless.overflow
                          PointsSection
      .flex3
        AttributeSection
        .flexcol.navy
          .background
            .texture
            .flexrow.panel.borderless.wide
              .flex2.wide
                .portrait-frame.pr-xs.wide
                  PortraitFrame(style="min-width: 182px;")
                    .flexcol.wide.gold
                      .flex1
                        h2.font-cinzel {localize(`${SYSTEM_CODE}.Description`)}
                      .flex1
                        .flexrow.justify-vertical
                          .flex2.left.pl-md
                            label.gold {localize(`${SYSTEM_CODE}.Name`)}
                          .flex2.wide
                            DocInput.wide(id="name" name="name" valuePath="name")
                      hr
                      .flex3
                        .left.panel.borderless.overflow.prose
                          ProseMirror( editable="{true}" attr="system.description" )

                       

</template>

<style lang="sass">
  @import '../../../../styles/Mixins.sass'

  .fuscia
    +background(rgb(76 20 32), 0.05 )
  .purple
    +background(rgb(42 20 76), 0.05 )
  .navy
    +background(rgb(20 45 76), 0.05 )
  .teal
    +background(rgb(20 68 76), 0.05 )
  .burgundy
    +background(rgb(76 35 20), 0.05 )

  .portrait-frame
    margin-right: -2px
    z-index: 2
  // +background(rgb(29 29 29))
  // +background(rgb(64 47 22), 0.1)
  // +background(rgb(20 45 76), 0.05 )
  // +background(rgb(48 76 20), 0.05 )
  // +background5(rgb(20 68 76), 0.05 )
  // +background4(rgb(76 35 20), 0.05 )
  // +background3(rgb(42 20 76), 0.05 )
  // +background2(rgb(74 20 76), 0.05 )
  // +background(rgb(76 20 32), 0.05 )
  .inset
    +inset(0.5rem, 0 0 5px rgba(165,0,0,1) inset)
    width: 100%
  .background
    overflow-y: auto
  // +background(rgb(66 76 20), 0.05)
</style>
