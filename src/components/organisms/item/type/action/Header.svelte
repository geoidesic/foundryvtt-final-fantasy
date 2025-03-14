<script>
  import { onMount, getContext } from "svelte";
  import { getCROptions, getLimitationOptions, getRangeOptions } from "~/src/helpers/constants.js";
  import { localize } from "~/src/helpers/util";
  const item = getContext("#doc");

  const CROptions = getCROptions();
  const limitationOptions = getLimitationOptions();
  const rangeOptions = getRangeOptions();

  const rangeDescription = (range) => {
    const rangeOption = rangeOptions.find((option) => option.value === range);
    return rangeOption ? rangeOption.label : range;
  }

</script>
<template lang='pug'>
  .item-header
    .flexcol.description-tab
      .flexrow
        .flexcol.flex1.left
          ol.properties-list
            li.bg-gold.white.border-gold {$item?.system?.type?.capitalize()}
            +if("$item?.system?.hasCostMP")
              li Cost: {$item?.system?.costMP} MP
            +if("$item?.system?.hasCR")
              li {CROptions.find((option) => option.value === $item?.system?.CR)?.label}
            +if("$item?.system?.hasCheck")
              li {$item?.system?.checkAttribute.toUpperCase()}
            +if("$item?.system?.hasLimitation")
              li {limitationOptions.find((option) => option.value === $item?.system?.limitation)?.label}
            +if("$item?.system?.hasRanged")
              li(data-tooltip="{rangeDescription($item?.system?.rangeType)}") {localize("Types.Item.Range")}: {$item?.system?.rangeType}
            +if("$item?.system?.hasTarget")
              li {localize("Types.Item.Target")}: {$item?.system?.target.capitalize()}
            +if("$item?.system?.hasTrigger")
              li {localize("Types.Item.Trigger")}: {$item?.system?.trigger.capitalize()}
            +if("$item?.system?.directHitType")
              li {localize("Types.Item.Types.action.DirectHit")}: {$item?.system?.directHitType.capitalize()}
                +if("$item?.system?.directHitDamage")
                  | : {$item?.system?.directHitDamage}

    
</template>
<style lang='sass'>
  @use '../../../../../styles/_mixins' as mixins

  .description-tab
    +mixins.itemSheetDescriptionTab
</style>