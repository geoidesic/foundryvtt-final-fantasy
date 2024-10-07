<script>
  import { onMount, getContext } from 'svelte';
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
  import DocCheckbox from "~/src/components/atoms/controls/DocCheckbox.svelte";

  const item = getContext("#doc");
  game.system.log.d("Details", item.system);

  $: game.system.log.d("Details", item.system);
</script>
  <template lang="pug">
    .item-sheet.details
      .flexcol.flex3.left
        h3.left Range
        .flexrow.justify-flexrow-vertical
          .flex2
            label Ranged
          .flex2.right
            DocCheckbox( name="ranged" valuePath="system.ranged")
        +if("$item.system.ranged")
          .flexrow.sheet-row
            .flex2
              label Range type
            .flex2.right
              DocInput( name="rangeType" valuePath="system.rangeType")
          .flexrow.sheet-row
            .flex2
              label Range value
            .flex2.right
              DocInput( name="rangeValue" type="number" valuePath="system.rangeValue")

        h3.left Checks
        h3.left Extras
        .flexrow.sheet-row
          .flex2
            label Trigger
          .flex2
            DocInput( name="trigger" valuePath="system.trigger")
        .flexrow.sheet-row
          .flex2
            label Target
          .flex2
            DocInput( name="target" valuePath="system.target")
        .flexrow.sheet-row
          .flex2
            label Direct Hit
          .flex2
            DocInput( name="directHit" valuePath="system.directHit")
        .flexrow.sheet-row
          .flex2
            label Heavier Shot
          .flex2
            DocInput( name="heavierShot" valuePath="system.heavierShot")
        .flexrow.sheet-row
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