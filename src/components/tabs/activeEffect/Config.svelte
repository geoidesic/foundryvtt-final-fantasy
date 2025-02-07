<script>
import { getContext, onMount } from "svelte";
import { localize } from "~/src/helpers/util";
import { SYSTEM_ID } from "~/src/helpers/constants";
import { getDefaultStatusEffects } from "~/src/helpers/Conditions";
import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";
import DocCheckbox from "~/src/components/atoms/controls/DocCheckbox.svelte";
import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
import TagSelect from "~/src/components/molecules/TagSelect.svelte";

const doc = getContext("#doc");

const stackingOptions = [
  { value: "differentSource", label: localize("EFFECT.Stackable.Options.differentSource") },
  { value: "anySource", label: localize("EFFECT.Stackable.Options.anySource") },
  { value: "replaces", label: localize("EFFECT.Stackable.Options.replaces") }
];

$: statusOptions = getDefaultStatusEffects().map(status => status.id);

onMount(async () => {
  console.log('ActiveEffectSheet Config');
});
</script>
<template lang="pug">

.item-sheet.details.overflow.wide.inset.mt-sm.high
  .flexcol.flex3.left.high.wide.mb-md
    .flex0
      .flexrow.justify-vertical
        .flex4
          h1.center {localize("Config")}
      .flexrow.justify-vertical
        .flex1
          label.gold(for="name") {localize("Name")}
        .flex4.right
          DocInput(name="name" alwaysEditable="{true}" valuePath="name" fullWidth="{true}" placeholder="Effect Name")
    .flex0.mt-sm
      .flexrow.justify-vertical
        .flex4
          label.gold(for="transfer") {localize("EFFECT.TransferEffectToActor.Label")}
        .flex0.right
          DocCheckbox(name="transfer" valuePath="transfer")
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
          label.gold(for="stackable") {localize("EFFECT.Stackable.Label")}
        .flex4.right
          DocSelect.wide.right(
            id="stackable" 
            name="stackable" 
            options="{stackingOptions}" 
            valuePath="{`flags.${SYSTEM_ID}.stackable`}"
            defaultValue="differentSource"
          )
      .flexrow.justify-vertical
        .flex4
          p.caption  {localize("EFFECT.Stackable.Caption")}

      .flexrow.justify-vertical
        .flex4
          label.gold(for="suspended") {localize("EFFECT.Suspended.Label")}
        .flex0.right
          DocCheckbox(name="suspended" valuePath="{`disabled`}")
      .flexrow.justify-vertical
        .flex4
          p.caption  {localize("EFFECT.Suspended.Caption")}

      .flexrow.justify-vertical
        .flex4
          label.gold(for="statuses") {localize("EFFECT.Label.Statuses")}
      .flexcol.sheet-row.justify-vertical
        .flex2.left
          TagSelect(availableTags="{statusOptions}" tagsPath="statuses")
    
    .flex1.mb-xl
      .flexrow.justify-vertical
        .flex4
          label.gold(for="description") {localize("EFFECT.Description.Label")}
      .flexcol.sheet-row.justify-vertical.high
        .flex2.left.prose.high.short
          ProseMirror( id="description" name="description" attr="description")
    
</template>
<style lang="sass">
  @use '../../../styles/_mixins' as mixins
  .inset
    +mixins.inset(1rem)
  label
    font-size: var(--size-md-h)
</style>