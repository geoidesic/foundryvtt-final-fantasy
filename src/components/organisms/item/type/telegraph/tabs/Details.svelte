<script>
  import { getContext } from "svelte";
  import { localize } from "#runtime/util/i18n";
  import { getCROptions, getRangeOptions, getLimitationOptions, getAspectedOptions, getTargetOptions, getHeavyshotOptions, getTriggerOptions, getDirectHitOptions, getTypeOptions } from "~/src/helpers/constants.js";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
  import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";
  import DocCheckbox from "~/src/components/atoms/controls/DocCheckbox.svelte";

  const item = getContext("#doc");

  const typeOptions = getTypeOptions();
  const rangeOptions = getRangeOptions();
  const targetOptions = getTargetOptions();
  const triggerOptions = getTriggerOptions();
  const CROptions = getCROptions();

  const classificationOptions = [
    { value: "fixed", label: localize("FF15.Types.Item.Types.Options.Telegraph.fixed") },
    { value: "movable", label: localize("FF15.Types.Item.Types.Options.Telegraph.movable") }
  ];



</script>

<template lang="pug">
  .item-sheet.details.overflow.wide
    .flexcol.flex3.left.high.wide
      h3.left {localize("FF15.General")}
      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="type") {localize("FF15.Type")}
        .flex4.right.wide
          DocSelect.wide.right(id="type" name="type" type="number" options="{typeOptions}" valuePath="system.type")
      
      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="source") {localize("FF15.Types.Item.Types.telegraph.Source")}
        .flex4.right.wide
          DocInput.wide.right(id="source" name="source" valuePath="system.source")
      
      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="controller") {localize("FF15.Types.Item.Types.telegraph.Controller")}
        .flex4.right.wide
          DocInput.wide.right(id="controller" name="controller" valuePath="system.controller")
      
      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="classification") {localize("FF15.Types.Item.Types.telegraph.Classification")}
        .flex4.right.wide
          DocSelect.wide.right(id="classification" name="classification" options="{classificationOptions}" valuePath="system.classification")
      
      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="origin") {localize("FF15.Types.Item.Types.telegraph.Origin")}
        .flex4.right.wide
          DocInput.wide.right(id="origin" name="origin" valuePath="system.origin")
      

      .flexrow.justify-vertical
        .flex4
          h3.left {localize("FF15.CR")}
        .flex0.right
          DocCheckbox( name="hasCR" valuePath="system.hasCR")

      +if("$item.system.hasCR")
        .flexrow.sheet-row.justify-vertical.wide
          .flex1
            label(for="CR") {localize("FF15.Type")}
          .flex4.right.wide
            DocSelect.wide.right(id="CR" name="CR" options="{CROptions}" valuePath="system.CR")


      .flexrow.justify-vertical
        .flex4
          h3.left  {localize("FF15.Types.Item.Trigger")}
        .flex0.right
          DocCheckbox( name="hasTrigger" valuePath="system.hasTrigger")

      +if("$item.system.hasTrigger")
        .flexrow.sheet-row.justify-vertical.wide
          .flex1
            label(for="trigger") {localize("FF15.Type")}
          .flex4.right.wide
            DocSelect.wide.right(id="trigger" name="trigger" type="number" options="{triggerOptions}" valuePath="system.trigger")
      
      .flexrow.justify-vertical
        .flex4
          h3.left {localize("FF15.Types.Item.Target")}
        .flex0.right
          DocCheckbox(id="hasTarget" name="hasTarget" valuePath="system.hasTarget")

      +if("$item.system.hasTarget")
        .flexrow.sheet-row.justify-vertical.wide
          .flex1
            label(for="target") {localize("FF15.Type")}
          .flex4.right.wide
            DocSelect.wide.right(id="target" name="target" options="{targetOptions}" valuePath="system.target")

      .flexrow.justify-vertical
        .flex4
          h3.left {localize("FF15.Types.Item.Range")}
        .flex0.right
          DocCheckbox( name="hasRanged" valuePath="system.hasRanged")
      +if("$item.system.hasRanged")

        .flexrow.sheet-row.justify-vertical.wide
            .flex1
              label(for="rangeType")  {localize("FF15.Type")}
            .flex4.right.wide
              DocSelect.wide.right.wide(id="rangeType" name="rangeType" options="{rangeOptions}" valuePath="system.rangeType")

      .flexcol.sheet-row.justify-vertical.high
        .flex2
          h3.left {localize("FF15.Types.Item.Effect")}
        .flex2.left.prose.high
          ProseMirror(id="effect" name="effect" attr="system.effect")

</template>

<style lang="sass">
  @import '../../../../../../styles/Mixins.sass'
  .details
    max-height: calc(100% - 15px)
    +inset(1rem)
</style> 