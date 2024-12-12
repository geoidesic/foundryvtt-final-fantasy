<script>
  import { onMount, getContext } from "svelte";
  import { getCROptions, getLimitationOptions } from "~/src/helpers/constants.js";

  const item = getContext("#doc");

  const CROptions = getCROptions();
  const limitationOptions = getLimitationOptions();

</script>
<template lang='pug'>
  .item-header
    .flexcol.description-tab
      .flexrow
        .flexcol.flex1.left
          ol.properties-list
            li.bg-gold.white.border-gold {$item.system.type.capitalize()}
            +if("$item.system.hasCost")
              li Cost: {$item.system.cost} MP
            +if("$item.system.hasCR")
              li {CROptions.find((option) => option.value === $item.system.CR)?.label}
            +if("$item.system.hasCheck")
              li {$item.system.checkAttribute.toUpperCase()}
            +if("$item.system.hasHeavierShot")
              li Heavier Shot Type: {$item.system.heavierShotType}
            +if("$item.system.hasLimitation")
              li {limitationOptions.find((option) => option.value === $item.system.limitation)?.label}
            +if("$item.system.hasRanged")
              li Range: {$item.system.rangeType}
            +if("$item.system.hasTarget")
              li Target: {$item.system.target.capitalize()}
            +if("$item.system.hasTrigger")
              li Trigger: {$item.system.trigger.capitalize()}
            +if("$item.system.directHitType")
              li Direct Hit: {$item.system.directHitType.capitalize()}
                +if("$item.system.directHitDamage")
                  | : {$item.system.directHitDamage}

    
</template>
<style lang='sass'>
  @import '../../../../../styles/Mixins.sass'

  .description-tab
    +itemSheetDescriptionTab
</style>