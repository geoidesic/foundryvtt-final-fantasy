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
            +if("$item.system.hasCheck")
              li Check: {$item.system.checkAttribute.toUpperCase()}
            +if("$item.system.hasCR")
              li CR: {$item.system.CR.toUpperCase()}
            +if("$item.system.directHitType")
              li Direct Hit {$item.system.directHitType.capitalize()}
                +if("$item.system.directHitDamage")
                  | : {$item.system.directHitDamage}
            +if("$item.system.hasHeavierShot")
              li Heavier Shot Type: {$item.system.heavierShotType}
            +if("$item.system.hasLimitation")
              li Limitation: {$item.system.limitation}
            +if("$item.system.hasRanged")
              li Range: {$item.system.rangeType}
            +if("$item.system.hasTarget")
              li Target: {$item.system.target.capitalize()}
            +if("$item.system.hasTrigger")
              li Trigger: {$item.system.trigger}

    
</template>
<style lang='sass'>
  @import '../../../../../styles/Mixins.sass'

  .description-tab
    +itemSheetDescriptionTab
</style>