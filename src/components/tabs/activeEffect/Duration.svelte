<script>
  import { getContext } from "svelte";
  import { localize } from "~/src/helpers/util";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
  import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";
  import { getDurationTypeOptions } from "~/src/helpers/constants";

  const doc = getContext("#doc");

  // Reactive bindings for duration fields
  $: duration = $doc.duration || {};
  $: durationTypeOptions = getDurationTypeOptions();
</script>

<template lang="pug">
  .item-sheet.details.overflow
    .flexcol.flex3.left.high.wide
      h3.left {localize("EFFECT.Duration.Title")}
      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="durationType") {localize("EFFECT.Duration.Type")}
        .flex4.right.wide
          DocSelect.right(
            id="durationType"
            options="{durationTypeOptions}"
            valuePath="duration.type"
          )

      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="startTime") {localize("EFFECT.Duration.StartTime")}
        .flex4.right.wide
          DocInput.wide(id="startTime" valuePath="duration.startTime")

      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="turns") {localize("EFFECT.Duration.Turns")}
        .flex4.right.wide
          DocInput.wide(id="turns" valuePath="duration.turns")

      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="rounds") {localize("EFFECT.Duration.Rounds")}
        .flex4.right.wide
          DocInput.wide(id="rounds" valuePath="duration.rounds")

      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="startRound") {localize("EFFECT.Duration.StartRound")}
        .flex4.right.wide
          DocInput.wide(id="startRound" valuePath="duration.startRound")

      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="startTurn") {localize("EFFECT.Duration.StartTurn")}
        .flex4.right.wide
          DocInput.wide(id="startTurn" valuePath="duration.startTurn")

</template>

<style lang="sass">
@use '../../../styles/_mixins' as mixins

.details
  max-height: calc(100% - 15px) //- prevents the scrolling area's content from being hidden below the fold
  +mixins.inset(1rem)

label
  color: var(--color-highlight)
</style> 