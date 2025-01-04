<script>
import { getContext, onMount } from "svelte";
import { localize } from "~/src/helpers/util";
import { activeEffectModes } from "~/src/helpers/constants";

import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";
import DocInput from "~/src/components/atoms/controls/DocInput.svelte";

const doc = getContext('#doc');

// Initialize with empty array to ensure it's always iterable
let pendingChanges = [];
let buttonAnimation = '';

onMount(() => {
  pendingChanges = ($doc.changes || []).map(change => ({...change}));
});

function handleInputChange(event, index, field) {
  const { value } = event.detail;
  pendingChanges[index][field] = value;
  // Force Svelte to recognize the array update
  pendingChanges = [...pendingChanges];
}

function handleMouseLeave() {
  if (buttonAnimation) {
    buttonAnimation = '';
  }
  game.system.log.b('mouse leave');
}

function handleSelectChange(event, index) {
  const { value } = event.detail;
  pendingChanges[index].mode = value;
  // Force Svelte to recognize the array update
  pendingChanges = [...pendingChanges];
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
    buttonAnimation = 'success-glow hover-disabled';
    return;
  }
  
  for(const change of pendingChanges) {
    if(!change.key || (change.mode < 0 || change.mode > 5) || !change.value) {
      game.system.log.b(pendingChanges);
      ui.notifications.warn('Please complete all fields');
      buttonAnimation = 'error-shake hover-disabled ';
      return;
    }
    change.priority = 1;
  }

  //- save changes
  game.system.log.g('Saving...', pendingChanges);
  $doc.update({ changes: pendingChanges });
  game.system.log.g('Changes saved');
  buttonAnimation = 'success-glow hover-disabled';
}

onMount(async () => {
  console.log('Changes', $doc);
});
</script>
<template lang="pug">

.item-sheet.details.overflow.wide.inset.mt-sm
  .flexcol.flex3.left.high.wide.mb-md
    h1.font-cinzel.center Changes
    table.borderless
      thead
        tr.gold
          th.left.expand(scope="col") {localize('EFFECT.Change.Key')}
          th.shrink.left.fixed(scope="col") {localize('EFFECT.Change.Mode')}
          th.left.expand(scope="col") {localize('EFFECT.Change.Value')}
          th.buttons(scope="col")
            button.stealth(on:click!="{() => addChange()}")
              i.fa.fa-plus
      tbody
        +each("pendingChanges as change, i")
          tr
            td
              DocInput( valuePath="{`changes[${i}].key`}"  alwaysEditable="{true}" updateOnBlur="{true}" handleOwnUpdates="{false}" on:change!="{(e) => handleInputChange(e, i, 'key')}" )
            td.shrink
              DocSelect(
                valuePath="{`changes[${i}].mode`}" 
                options="{activeEffectModes}"
                handleOwnUpdates="{false}"
                on:change!="{(e) => handleSelectChange(e, i)}"
              )
            td
              DocInput(
                valuePath="{`changes[${i}].value`}" 
                alwaysEditable="{true}" 
                updateOnBlur="{true}" 
                handleOwnUpdates="{false}" 
                on:change!="{(e) => handleInputChange(e, i, 'value')}"
              )
            td.buttons
              button.stealth(on:click!="{() => deleteChange(i)}" )
                i.fa.fa-trash

    .flexrow.mt-sm
      button.glossy-button.gold-light.hover-shine(
        class="{buttonAnimation}"
        on:click="{save}"
        on:mouseleave="{handleMouseLeave}"
      ) Save Changes

</template>
<style lang="sass">

  @import '../../../styles/Mixins.sass'
  .inset
    +inset(1rem, 0 -3px 20px rgba(165, 131, 99, 1) inset, 0 0 20px 0 )
  table
    thead
      tr
        background-color: var(--color-scrollbar)

  .hover-disabled
    &.hover-shine
      &:hover
        box-shadow: none

  @keyframes success-glow
    0%, 100%
      box-shadow: 0 0 0 rgba(40, 200, 40, 0)
    50%
      box-shadow: 0 0 20px rgba(40, 200, 40, 1)

  @keyframes error-shake
    0%, 100%
      transform: translateX(0)
    20%
      transform: translateX(-4px)
    40%
      transform: translateX(4px)
    60%
      transform: translateX(-4px)
    80%
      transform: translateX(4px)

  .success-glow
    animation: success-glow 0.6s ease-in-out

  .error-shake
    animation: error-shake 0.5s ease-in-out

</style>
