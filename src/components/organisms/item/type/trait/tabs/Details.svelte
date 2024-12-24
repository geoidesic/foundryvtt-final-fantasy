
<script>
  import { onMount, getContext } from "svelte";
  import { localize } from "#runtime/svelte/helper";
  import { getLimitationOptions } from "~/src/helpers/constants"
  import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";
  import DocCheckbox from "~/src/components/atoms/controls/DocCheckbox.svelte";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";

  const item = getContext("#doc");

  const limitationOptions = getLimitationOptions();


  const typeOptions = [
    { value: "Buff", label: localize("FF15.Types.Item.Types.Options.TraitType.Buff") },
    { value: "Debuff", label: localize("FF15.Types.Item.Types.Options.TraitType.Debuff") },
    { value: "Trait", label: localize("FF15.Types.Item.Types.Options.TraitType.Trait") },
  ];
  const modOptions = [
    { value: "All Checks", label: localize("FF15.Types.Item.Types.Options.ModType.Allchecks") },
    { value: "All Damage", label: localize("FF15.Types.Item.Types.Options.ModType.AllDamage") },
    { value: "Bonus Dice", label: localize("FF15.Types.Item.Types.Options.ModType.BonusDice") },
    { value: "Movement", label: localize("FF15.Types.Item.Types.Options.ModType.Movement") },
    { value: "DOT", label: localize("FF15.Types.Item.Types.Options.ModType.DOT") },
  ];
  const operatorOptions = [
    { value: "+", label: '+' },
    { value: "-", label: '-' },
  ];

</script>

<template lang="pug">
.item-sheet.details.overflow
  .flexcol.flex3.left.high.bigbottom
    h3.left General
    .flexrow.sheet-row.justify-vertical
      .flex3
        label(for="type") Type
      .flex2.right
        DocSelect.right(id="type" name="type" options="{typeOptions}" valuePath="system.type")
      
    .flexrow.justify-vertical
      .flex4
        h3.left Limitation
      .flex0.right
        DocCheckbox( name="hasLimitation" valuePath="system.hasLimitation")
    +if("$item.system.hasLimitation")
      .flexrow.sheet-row.justify-vertical
        .flex2
          label(for="limitation") Limitation
        .flex2.right
          DocSelect.right(id="limitation" name="limitation" options="{limitationOptions}" valuePath="system.limitation")
  
      
    .flexrow.justify-vertical
      .flex4
        h3.left Modifier
      .flex0.right
        DocCheckbox( name="hasModifier" valuePath="system.hasModifier")
    +if("$item.system.hasModifier")
      .flexrow.sheet-row.justify-vertical
        .flex3.left
          DocSelect.left(style="min-width: 4em;" id="modType" name="modType" options="{modOptions}" valuePath="system.modType")
        .flex1()
          DocSelect(style="width: 2em;" id="operator" name="operator" options="{operatorOptions}" valuePath="system.operator")
        .flex3.right
          DocInput.wide.right(id="modAmount" name="modAmount" valuePath="system.modAmount")
  
</template>

<style lang="sass">
  @import '../../../../../../styles/Mixins.sass'

  .details
    max-height: calc(100% - 15px) //- prevents the scrolling area's content from being hidden below the fold
    +inset(1rem)
</style>
