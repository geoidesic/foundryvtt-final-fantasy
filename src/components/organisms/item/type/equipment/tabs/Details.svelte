<script>
  import { onMount, getContext } from "svelte";
  import { localize } from "#runtime/util/i18n";
  import { isParentActor} from "~/src/helpers/util";
  import { getTypeOptions } from "~/src/helpers/constants.js";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
  import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";
  import DocCheckbox from "~/src/components/atoms/controls/DocCheckbox.svelte";

  import { PCModel } from "~/src/models/actors/PC.js";

  const item = getContext("#doc");
  const typeOptions = getTypeOptions();


  $: parentIsActor = isParentActor($item);

</script>

<template lang="pug">
  .item-sheet.details
    .flexcol.flex3.left.high.wide
      h3.left {localize("FFXIV.General")}
      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="type") {localize("FFXIV.Action")} {localize("FFXIV.Type")}
        .flex4.right.wide
          DocSelect.wide.right(id="type" name="type" type="number" options="{typeOptions}" valuePath="system.type")
      
      +if("parentIsActor")
        .flexrow.sheet-row
          .flex2
            label(for="quantity") Quantity 
          .flex2.right
            DocInput(id="quantity" name="quantity" valuePath="system.quantity")



</template>

<style lang="sass">
    @use '../../../../../../styles/_mixins' as mixins
    .details
      +mixins.inset
</style>
