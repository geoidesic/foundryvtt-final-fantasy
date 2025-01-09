<script>
  import { onMount, getContext } from "svelte";
  import { localize } from "#runtime/util/i18n";
  import { SYSTEM_CODE } from "~/src/helpers/constants";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
  import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";
  import DocCheckbox from "~/src/components/atoms/controls/DocCheckbox.svelte";
  import ItemBucket from "~/src/components/molecules/ItemBucket.svelte";

  const item = getContext("#doc");
  
  const grantColumns = [{
    header: "",
    path: "type",
    itemType: "action"
  }];

  const levelLabel = localize(`${SYSTEM_CODE}.Types.Item.Types.job.Level`);
  const roleLabel = localize(`${SYSTEM_CODE}.Types.Item.Types.job.Role`);

</script>

<template lang="pug">
.item-sheet.details.overflow.high
  .flexcol
    .flex0.pa-sm
      .flexrow
        .flex1.left
          label(for="level")=levelLabel
        .flex1
          DocInput.wide(type="text" name="level" valuePath="system.level")
      .flexrow  
        .flex1.left
          label(for="role")=roleLabel
        .flex1
          DocInput.wide(type="text" name="role" valuePath="system.role")
    .flex3.left.high
      ItemBucket(title="Granted Abilities" key="grants" additionalColumns=grantColumns)
</template>

<style lang="sass">
  @use '../../../../../../styles/_mixins' as mixins

  .details
    max-height: calc(100% - 0px) //- prevents the scrolling area's content from being hidden below the fold
    +mixins.inset
</style>