<script>
import { getContext, onMount } from "svelte";
import { localize } from "~/src/helpers/util";
import { SYSTEM_ID } from "~/src/helpers/constants";
import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";
import DocCheckbox from "~/src/components/atoms/controls/DocCheckbox.svelte";
import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";

const doc = getContext("#doc");

onMount(async () => {
  console.log('ActiveEffectSheet Config');
});
</script>
<template lang="pug">
.item-sheet.details.overflow.wide
  .flexcol.flex3.left.high.wide
    h1.center {localize("Config")}
    .flexcol.sheet-row.justify-vertical.high
      .flex2
        label.gold(for="description") {localize("EFFECT.Description.Label")}
      .flex2.left.prose.high.short
        ProseMirror( id="description" name="description" attr="description")

    .flexrow.justify-vertical
      .flex4
        label.gold(for="transfer") {localize("EFFECT.TransferEffectToActor.Label")}
      .flex0.right
        DocCheckbox(name="transfer" valuePath="system.transfer")
    .flexrow.justify-vertical
      .flex4
        p.caption  {localize("EFFECT.TransferEffectToActor.Caption")}
    .flexrow.justify-vertical
      .flex4
        label.gold(for="overlay") {localize("EFFECT.Overlay.Label")}
      .flex0.right
        DocCheckbox(name="overlay" valuePath="{`flags.${SYSTEM_ID}.overlay`}")
    .flexrow.justify-vertical
      .flex4
        p.caption  {localize("EFFECT.Overlay.Caption")}
    .flexrow.justify-vertical
      .flex4
        label.gold(for="suspended") {localize("EFFECT.Suspended.Label")}
      .flex0.right
        DocCheckbox(name="suspended" valuePath="{`disabled`}")
    .flexrow.justify-vertical
      .flex4
        p.caption  {localize("EFFECT.Suspended.Caption")}

</template>
<style lang="sass">
  label
    font-size: var(--size-md-h)
</style>