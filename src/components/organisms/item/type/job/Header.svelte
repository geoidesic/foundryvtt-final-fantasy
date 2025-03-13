<script>
  import { onMount, getContext } from "svelte";
  import { localize } from "~/src/helpers/util";
const item = getContext("#doc");

</script>
<template lang='pug'>

.item-header
  .flexcol.description-tab
    .flexrow
      .flexcol.flex1.left
        ol.properties-list
          li {localize("Role")}: {$item?.system?.role?.capitalize()}
          li {localize("Level")}: {$item?.system?.level}
    
</template>
<style lang='sass'>
  @use '../../../../../styles/_mixins' as mixins

  .description-tab
    +mixins.itemSheetDescriptionTab
</style>