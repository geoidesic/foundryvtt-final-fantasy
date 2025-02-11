<script>
import { localize } from "~/src/helpers/util";
import { getContext } from "svelte";
import { getDurationQualifierOptions, getDurationTypeOptions, getDurationOptions, getDurationUnits } from "~/src/helpers/constants"
import ArraySelect from "~/src/components/atoms/controls/ArraySelect.svelte";
import DocCheckbox from "~/src/components/atoms/controls/DocCheckbox.svelte";

const item = getContext("#doc");

const durationTypeOptions = getDurationTypeOptions();
const durationQualifierOptions = getDurationQualifierOptions();
const durationOptions = getDurationOptions();
const durationUnitsOptions = getDurationUnits();

async function addDuration() {
  const existingDurations = [...$item.system.durations || []];
  existingDurations.push({
    type: null,
    amount: null,
    units: "rounds",
    qualifier: ""
  });
  await $item.update({ system: { durations: existingDurations } });
  game.system.log.pink(`Added duration: ${existingDurations}`, $item);
}

function removeDuration(index) {
  const existingDurations = [...$item.system.durations];
  existingDurations.splice(index, 1);
  $item.update({ system: { durations: existingDurations } });
}

$: durations = $item.system.durations;

async function updateDuration(index, field, value) {
  const updatedDurations = [...durations];
  updatedDurations[index] = { ...updatedDurations[index], [field]: value };
  await $item.update({ "system.durations": updatedDurations });
}
</script>

<template lang="pug">
.duration
  .flexrow.justify-vertical
    .flex4
      h2.left Duration
    .flex0.right
      button.small.gold(on:click="{addDuration}")
        i.fas.fa-plus

  +if('durations && durations.length > 0')
    +each('durations as duration, i')
      .subsection
        .flexrow.justify-vertical.wide
          .flex4
            h3.left Duration {i + 1}
          .flex0.right
            button.small.gold(on:click!="{() => removeDuration(i)}")
              i.fas.fa-times
        .flexrow.sheet-row.justify-vertical.wide.px-sm
          .flex1
            label(for="{`durationType${i}`}") {localize('Types.Item.Types.Options.DurationType.label')}
          .flex1
            ArraySelect.left(
              id="{`durationType${i}`}" 
              options="{durationTypeOptions}" 
              value="{duration.type}"
              on:change!="{(e) => updateDuration(i, 'type', e.detail.value)}"
            )
        +if('duration.type === "hasAmount" || duration.type === "hasQualifier"')
          .flexrow.sheet-row.justify-vertical.wide.px-sm.bg-black.pa-sm
            .flex3.left
              +if('duration.type === "hasAmount"')
                label(for="{`durationAmount${i}`}") {localize('Types.Item.Types.Options.DurationAmount.label')}
              +if('duration.type === "hasQualifier"')
                label(for="{`durationQualifier${i}`}") {localize('Types.Item.Types.Options.DurationQualifier.label')}
            .flex1.right Units
          .flexrow.sheet-row.justify-vertical.wide.px-sm.border
            +if('duration.type === "hasAmount"')
              .flex3.left.nowrap
                ArraySelect.left.wide(
                  id="{`durationAmount${i}`}"
                  options="{durationOptions}"
                  value="{duration.amount}"
                  on:change!="{(e) => updateDuration(i, 'amount', e.detail.value)}"
                )
            +if('duration.type === "hasQualifier"')
              .flex2.left.nowrap
                ArraySelect.left.wide(
                  id="{`durationQualifier${i}`}"
                  options="{durationQualifierOptions}"
                  value="{duration.qualifier}"
                  on:change!="{(e) => updateDuration(i, 'qualifier', e.detail.value)}"
                )
            +if('duration.type === "hasAmount" || (duration.qualifier && (duration.type === "hasQualifier" && duration.qualifier !== "untilDamage" && duration.qualifier !== "nextAbility"))')
              .flex2.right
                ArraySelect.right.wide(
                  id="{`durationUnits${i}`}"
                  options="{durationUnitsOptions}"
                  value="{duration.units}"
                  on:change!="{(e) => updateDuration(i, 'units', e.detail.value)}"
                )

</template>

<style lang="sass">
@use '../../../styles/_mixins' as mixins
label
  color: var(--color-gold)
.subsection
  +mixins.inset(0.5rem)
  margin-bottom: 0.5rem
button.small
  padding: 0 3px 0 5px
  line-height: 1.7
  min-height: 1.5rem
  min-width: 1.5rem
  display: flex
  align-items: center
  justify-content: center
  i
    font-size: 0.8rem
</style>