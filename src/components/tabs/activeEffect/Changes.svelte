<script>
import { getContext, onMount } from "svelte";
import { localize } from "~/src/helpers/util";
import { activeEffectModes } from "~/src/helpers/constants";

import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";
import DocInput from "~/src/components/atoms/controls/DocInput.svelte";

const doc = getContext('#doc');

// Initialize with empty array to ensure it's always iterable
let pendingChanges = [];

onMount(() => {
  pendingChanges = ($doc.changes || []).map(change => ({...change}));
});

function handleInputChange(event, index, field) {
  const { value } = event.detail;
  pendingChanges[index][field] = value;
}

function deleteChange(index) {
  pendingChanges = pendingChanges.filter((_, i) => i !== index);
}

function addChange() {
  pendingChanges = [...pendingChanges, {
    key: "",
    mode: null,
    value: ""
  }];
}

function save() {
  //- validate changes
  if(pendingChanges.length === 0) {
    $doc.update({ changes: [] });
    game.system.log.info('No changes to save');
    return;
  }
  for(const change of pendingChanges) {
    if(!change.key || !change.mode || !change.value) {
      game.system.log.warn('Please complete all fields');
      ui.notifications.warn('Please complete all fields');
      return;
    }
  }
  //- save changes
  game.system.log.g('Saving...', pendingChanges);
  $doc.update({ changes: pendingChanges });
  game.system.log.g('Changes saved');
}

onMount(async () => {
  console.log('Changes', $doc);
});
</script>
<template lang="pug">
.item-sheet.details.overflow
  .flexcol.flex3.left
    h1.font-cinzel.center Changes
    table.borderless
      thead
        tr.gold
          th.left.expand(scope="col") {localize('EFFECT.Change.Key')}
          th.left.fixed(scope="col") {localize('EFFECT.Change.Mode')}
          th.left.fixed(scope="col") {localize('EFFECT.Change.Value')}
          th.buttons(scope="col")
            button.stealth(on:click!="{() => addChange()}")
              i.fa.fa-plus
      tbody
        +each("pendingChanges as change, i")
          tr
            td
              DocInput( valuePath="{`changes[${i}].key`}"  alwaysEditable="{true}" updateOnBlur="{true}" handleOwnUpdates="{false}" on:change!="{(e) => handleInputChange(e, i, 'key')}" )
            td
              DocSelect(valuePath="{`changes[${i}].mode`}" options="{activeEffectModes}" )
            td
              DocInput(valuePath="{`changes[${i}].value`}" alwaysEditable="{true}" updateOnBlur="{true}" handleOwnUpdates="{false}" on:change!="{(e) => handleInputChange(e, i, 'value')}")
            td.buttons
              button.stealth(on:click!="{() => deleteChange(i)}")
                i.fa.fa-trash

    button.mt-sm.glossy-button.gold-light.hover-shine(on:click="{save}") Save Changes

</template>
<style lang="sass">
  table
    thead
      tr
        background-color: var(--color-scrollbar)
</style>
