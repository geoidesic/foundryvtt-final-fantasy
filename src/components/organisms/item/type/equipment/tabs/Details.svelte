<script>
  import { onMount, getContext } from "svelte";
  import { localize } from "#runtime/svelte/helper";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
  import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";
  import DocCheckbox from "~/src/components/atoms/controls/DocCheckbox.svelte";
  import { isParentActor} from "~/src/helpers/util";

  import { PCModel } from "~/src/models/actors/PC.js";

  const item = getContext("#doc");


  $: parentIsActor = isParentActor($item);

</script>

<template lang="pug">
  .item-sheet.details
    .flexcol.flex3.left
      +if("parentIsActor")
        .flexrow.sheet-row
          .flex2
            label(for="quantity") Quantity 
          .flex2.right
            DocInput(id="quantity" name="quantity" valuePath="system.quantity")



</template>

<style lang="sass">
    @import '../../../../../../styles/Mixins.sass'
    .details
      @include inset
</style>
