<script>
  import { onMount, getContext } from "svelte";
  import { localize } from "~/src/helpers/util";
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
        title="{localize('Requires')}"
        key="requires",
      )
      ItemBucket(
        title="{localize('Removes')}"
        key="removes",
      )
      ItemBucket(
        title="{localize('Target')} {localize('Effects')}",
        key="grants",
      )
      ItemBucket(
        title="{localize('Source')} {localize('Effects')}",
        key="sourceGrants",
      )
      +if("$item.system.hasLimitation && $item.system.limitation && $item.system.limitationUnits")
        ItemBucket(
          title="{localize('Types.Item.SharedLimitation')}",
          key="sharedLimitation",
        )
      ItemBucket(
        title="{localize('Enabled')} {localize('Traits')}",
        key="enables",
      )
      ItemBucket(
        title="{localize('ProcTriggers')}",
        key="procs",
      )
        +if("$item.system.procs.value")
          .flexrow.sheet-row.justify-vertical.wide.gold.px-sm
            .flex1
              label(for="procTrigger") {localize("Threshold")}
            .flex4.right.wide
              DocInput.wide.right(id="procTrigger" name="procTrigger" type="number" valuePath="system.procTrigger")
      


  .flexrow.sheet-row.justify-vertical.px-sm
    .flex4
      h2.left Tags
    .flex0.right
      DocCheckbox( name="hasTags" valuePath="system.hasTags")
  +if("$item.system.hasTags")
    .px-sm
      TagInput
    //- allow breathing space at the bottom of the scroll area
  .pb-lg 
</template>


<style lang="sass">
  @use '../../../../../../styles/_mixins' as mixins
  :global(.item-bucket)
    min-height: 30%
  .details
    max-height: calc(100% - 0px) //- prevents the scrolling area's content from being hidden below the fold
    +mixins.inset
</style>