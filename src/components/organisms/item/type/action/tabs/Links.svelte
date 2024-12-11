<script>
  import { onMount, getContext } from "svelte";
  import { localize } from "#runtime/svelte/helper";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
  import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";
  import DocCheckbox from "~/src/components/atoms/controls/DocCheckbox.svelte";
  import ItemBucket from "~/src/components/molecules/ItemBucket.svelte";
  import TagInput from "~/src/components/molecules/TagInput.svelte";

  const item = getContext("#doc");

</script>

<template lang="pug">

.item-sheet.details.overflow.high
  .flexcol
    .flex3.left.high
      ItemBucket(
        title="Target Effects",
        key="grants",
      )
      hr
      ItemBucket(
        title="Enabled Traits",
        key="enables",
      )

      .flexrow.justify-vertical
        .flex4
          h3.left Tags
        .flex0.right
          DocCheckbox( name="hasTags" valuePath="system.hasTags")
      +if("$item.system.hasTags")
        TagInput
    //- allow breathing space at the bottom of the scroll area
    .pb-lg 
</template>


<style lang="sass">
  @import '../../../../../../styles/Mixins.sass'
  :global(.item-bucket)
    min-height: 30%
  .details
    max-height: calc(100% - 0px) //- prevents the scrolling area's content from being hidden below the fold
    +inset
</style>