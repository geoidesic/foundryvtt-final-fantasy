<script>
import { getContext, onMount } from "svelte";
import { localize } from "~/src/helpers/util";
import { activeEffectModes } from "~/src/helpers/constants";

import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";
import DocInput from "~/src/components/atoms/controls/DocInput.svelte";

const doc = getContext('#doc');

function deleteChange(index) {
  const changes = [...$doc.changes || []];
  changes.splice(index, 1);
  $doc.update({ changes });
}

onMount(async () => {
  console.log('Changes', $doc);
});
</script>
<template lang="pug">
.item-sheet.details.overflow
  .flexcol.flex3.left
    table.borderless
      thead
        tr.gold
          th.left.expand(scope="col") {localize('EFFECT.Change.Key')}
          th.left.fixed(scope="col") {localize('EFFECT.Change.Mode')}
          th.left.fixed(scope="col") {localize('EFFECT.Change.Value')}
          th.buttons(scope="col")
            button.stealth(on:click=addChange)
              i.fa.fa-plus
      tbody
        +each("$doc?.changes || [] as change, i")
          tr
            td
              DocInput(valuePath="{`changes[${i}].key`}" alwaysEditable="{true}" )
            td
              //- DocSelect(valuePath="{`changes[${i}].mode`}" options="{activeEffectModes}" )
            td
              DocInput(valuePath="{`changes[${i}].value`}" alwaysEditable="{true}" )
            td.buttons
              //- button.stealth(on:click!="{deleteChange(i)}")
                i.fa.fa-trash
</template>
<style lang="sass">
  table
    thead
      tr
        background-color: var(--color-scrollbar)
</style>
