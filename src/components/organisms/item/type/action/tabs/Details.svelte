<script>
  import { onMount } from 'svelte';
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
</script>
  <template lang="pug">
    .details
      .flexcol.flex3.left
        h3.left Range
        .flexrow
          .flex2
            label Range type
          .flex2
            DocInput( name="rangeType" valuePath="system.rangeType")

        h3.left Checks
        h3.left Extras
        .flexrow
          .flex2
            label Trigger
          .flex2
            DocInput( name="trigger" valuePath="system.trigger")
        .flexrow
          .flex2
            label Target
          .flex2
            DocInput( name="target" valuePath="system.target")
        .flexrow
          .flex2
            label Direct Hit
          .flex2
            DocInput( name="directHit" valuePath="system.directHit")
        .flexrow
          .flex2
            label Heavier Shot
          .flex2
            DocInput( name="heavierShot" valuePath="system.heavierShot")
        .flexrow
          .flex2
            label Limitation
          .flex2
            DocInput( name="limitation" valuePath="system.limitation")

        h3.left Base Effect
          .prose
            ProseMirror( attr="system.baseEffect" )
  </template>
  <style lang='sass'>
    @import '../../../../../../styles/Mixins.sass'
    .details
      @include inset
  </style>