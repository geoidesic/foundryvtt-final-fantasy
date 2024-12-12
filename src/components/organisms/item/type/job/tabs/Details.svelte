<script>
  import { onMount, getContext } from "svelte";
  import { localize } from "#runtime/svelte/helper";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
  import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";
  import DocCheckbox from "~/src/components/atoms/controls/DocCheckbox.svelte";
  import ItemBucket from "~/src/components/molecules/ItemBucket.svelte";

  const item = getContext("#doc");

</script>

<template lang="pug">

.item-sheet.details.overflow.high
  .flexcol
    .flex3.left.high
      ItemBucket(
        title="Grants",
        key="grants",
      )

</template>


<style lang="sass">
  @import '../../../../../../styles/Mixins.sass'

  .details
    max-height: calc(100% - 0px) //- prevents the scrolling area's content from being hidden below the fold
    +inset
</style>