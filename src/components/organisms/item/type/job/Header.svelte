<script>
  import { onMount, getContext } from "svelte";

const item = getContext("#doc");

</script>
<template lang='pug'>

.item-header
  .flexcol.description-tab
    .flexrow
      .flexcol.flex1.left
        ol.properties-list
          li Role: {$item?.system?.role?.capitalize()}
          li LV {$item?.system?.level}
    
</template>
<style lang='sass'>
  @import '../../../../../styles/Mixins.sass'

  .description-tab
    +itemSheetDescriptionTab
</style>