<script>
  import { onMount, getContext } from "svelte";
  import { localize } from "#runtime/util/i18n";
  import { SYSTEM_CODE } from "~/src/helpers/constants";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
  import PortraitFrame from "~/src/components/molecules/PortraitFrame.svelte";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";

</script>

<template lang="pug">

.navy
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
  @import '../../styles/Mixins.sass'

  .navy
    +background(rgb(20 45 76), 0.05 )
  
  .portrait-frame
    margin-right: -2px
    z-index: 2
  .background
    overflow-y: auto
</style>
