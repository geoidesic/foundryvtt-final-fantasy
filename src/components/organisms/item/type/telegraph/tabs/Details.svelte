<script>
  import { getContext } from "svelte";
  import { localize } from "#runtime/svelte/helper";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
  import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";

  const item = getContext("#doc");

  const classificationOptions = [
    { value: "fixed", label: localize("FF15.Types.Item.Types.Options.Telegraph.fixed") },
    { value: "movable", label: localize("FF15.Types.Item.Types.Options.Telegraph.movable") }
  ];
</script>

<template lang="pug">
  .item-sheet.details.overflow.wide
    .flexcol.flex3.left.high.wide
      h3.left Telegraph Details
      
      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="source") Source
        .flex4.right.wide
          DocInput.wide.right(id="source" name="source" valuePath="system.source")
      
      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="controller") Controller
        .flex4.right.wide
          DocInput.wide.right(id="controller" name="controller" valuePath="system.controller")
      
      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="classification") Classification
        .flex4.right.wide
          DocSelect.wide.right(id="classification" name="classification" options="{classificationOptions}" valuePath="system.classification")
      
      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="origin") Origin
        .flex4.right.wide
          DocInput.wide.right(id="origin" name="origin" valuePath="system.origin")
      
      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="range") Range
        .flex4.right.wide
          DocInput.wide.right(id="range" name="range" valuePath="system.range")
      
      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="target") Target
        .flex4.right.wide
          DocInput.wide.right(id="target" name="target" valuePath="system.target")
      
      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="activationTrigger") Activation Trigger
        .flex4.right.wide
          DocInput.wide.right(id="activationTrigger" name="activationTrigger" valuePath="system.activationTrigger")
      
      .flexcol.sheet-row.justify-vertical.high
        .flex2
          h3.left Effect
        .flex2.left.prose.high
          ProseMirror(id="effect" name="effect" attr="system.effect")

</template>

<style lang="sass">
  @import '../../../../../../styles/Mixins.sass'
  .details
    max-height: calc(100% - 15px)
    +inset(1rem)
</style> 