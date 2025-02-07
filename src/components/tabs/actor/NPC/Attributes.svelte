<script>
  import { onMount, getContext } from "svelte";
  import { SYSTEM_CODE } from "~/src/helpers/constants";
  import { localize } from "#runtime/util/i18n";
  import AttributeSection from "~/src/components/organisms/actor/NPC/AttributeSection.svelte";
  import PointsSection from "~/src/components/organisms/actor/PointsSectionNPC.svelte";
  import EffectsSection from "~/src/components/organisms/actor/EffectsSection.svelte";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import PortraitFrame from "~/src/components/molecules/PortraitFrame.svelte";
  import Portrait from "~/src/components/organisms/actor/Portrait.svelte";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
  import DescriptionBlockNPC from "~/src/components/molecules/DescriptionBlockNPC.svelte";

  export let sheet;
  const documentStore = getContext("#doc");

  const application = getContext("#external").application;
  const { width } = application.position.stores;

  $: smallwindow = $width <= 750
  $: largewindow = $width > 750
</script>

<template lang="pug">
  .panel.overflow
    .flexrow
      div(class="{smallwindow ? 'flex2' : 'flex3'}")
        .flexcol
          .purple
            .background
              .texture
              .flexrow.panel.borderless.wide
                .flex1(style="{smallwindow ? 'min-width: 120px;' : ''}")
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
        +if("largewindow")
          .flexcol
            DescriptionBlockNPC 


      div(class="{largewindow ? 'flex2' : 'flex3'}" style="min-width: 250px;")
        AttributeSection

    +if("smallwindow")
      .flexcol
        DescriptionBlockNPC
    
    .flexcol.teal
      .background
        .texture
        .flexrow.panel.borderless.wide
          .flex2.gold
            .portrait-frame.pr-xs
              PortraitFrame(size="40" style="min-width: 182px;")
                EffectsSection.high.wide
                       

</template>

<style lang="sass">
  @use '../../../../styles/_mixins' as mixins

  // .fuscia
  //   +mixins.background(rgb(76 20 32), 0.05 )
  .purple
    +mixins.background(rgb(42 20 76), 0.05 )
  // .navy
  //   +mixins.background(rgb(20 45 76), 0.05 )
  .teal
    +mixins.background(rgb(20 68 76), 0.05 )
  // .burgundy
  //   +mixins.background(rgb(76 35 20), 0.05 )

  .portrait-frame
    margin-right: -2px
    z-index: 2
  // +mixins.background(rgb(29 29 29))
  // +mixins.background(rgb(64 47 22), 0.1)
  // +mixins.background(rgb(20 45 76), 0.05 )
  // +mixins.background(rgb(48 76 20), 0.05 )
  // +mixins.background5(rgb(20 68 76), 0.05 )
  // +mixins.background4(rgb(76 35 20), 0.05 )
  // +mixins.background3(rgb(42 20 76), 0.05 )
  // +mixins.background2(rgb(74 20 76), 0.05 )
  // +mixins.background(rgb(76 20 32), 0.05 )
 
  .background
    overflow-y: auto
  // +mixins.background(rgb(66 76 20), 0.05)
</style>
