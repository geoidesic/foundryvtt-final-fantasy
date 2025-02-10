<script>
import { localize } from "~/src/helpers/util";
import { getContext, onMount } from "svelte";
import { getDurationQualifierOptions, getDurationTypeOptions, getDurationOptions, getDurationUnits } from "~/src/helpers/constants"
import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";
import DocCheckbox from "~/src/components/atoms/controls/DocCheckbox.svelte";

const item = getContext("#doc");

const durationTypeOptions = getDurationTypeOptions();
const durationQualifierOptions = getDurationQualifierOptions();
const durationOptions = getDurationOptions();
const durationUnitsOptions = getDurationUnits();

onMount(async () => {
  console.log('');
});
</script>
<template lang="pug">
.duration
  .flexrow.justify-vertical
    .flex4
      +if("$item.system.hasDuration")
        h2.left Duration
        +else
          h3.left Duration
    .flex0.right
      DocCheckbox( name="hasDuration" valuePath="system.hasDuration")

  +if("$item.system.hasDuration")
    .subsection
      .flexrow.sheet-row.justify-vertical.wide.px-sm
        .flex1
          label(for="durationType") {localize("Types.Item.Types.Options.DurationType.label")}
        .flex1
          DocSelect.left(id="durationType" name="durationType" options="{durationTypeOptions}" valuePath="system.durationType")
      +if("$item.system.durationType === 'hasAmount' || $item.system.durationType === 'hasQualifier'")
        .flexrow.sheet-row.justify-vertical.wide.px-sm.bg-black.pa-sm
          .flex3.left
            +if("$item.system.durationType === 'hasAmount'")
              label(for="durationAmount") {localize("Types.Item.Types.Options.DurationAmount.label")}
            +if("$item.system.durationType === 'hasQualifier'")
              label(for="durationQualifier") {localize("Types.Item.Types.Options.DurationQualifier.label")}
          .flex1.right Units
        .flexrow.sheet-row.justify-vertical.wide.px-sm.border
          .flex3.left.nowrap
            +if("$item.system.durationType === 'hasAmount'")
              DocSelect.left.wide(id="durationAmount" name="durationAmount" type="number" options="{durationOptions}" valuePath="system.durationAmount")
            +if("$item.system.durationType === 'hasQualifier'")
              DocSelect.left.wide(id="durationQualifier" name="durationQualifier" options="{durationQualifierOptions}" valuePath="system.durationQualifier")
          .flex1.right
            DocSelect.right.wide(id="durationUnits" name="durationUnits" options="{durationUnitsOptions}" valuePath="system.durationUnits")

</template>
<style lang="sass">
    @use '../../../styles/_mixins' as mixins
    
    .subsection
      +mixins.inset(0.5rem)
      margin-bottom: 0.5rem
</style>