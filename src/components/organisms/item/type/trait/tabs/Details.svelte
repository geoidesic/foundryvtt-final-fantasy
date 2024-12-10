
<script>
  import { onMount, getContext } from "svelte";
  import { localize } from "#runtime/svelte/helper";
  import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";
  import DocCheckbox from "~/src/components/atoms/controls/DocCheckbox.svelte";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";

  const item = getContext("#doc");


  const limitationOptions = [
    { value: "once", label: localize("FF15.Types.Item.Types.Options.Limitation.once") },
    { value: "twice", label: localize("FF15.Types.Item.Types.Options.Limitation.twice") },
    { value: "thrice", label: localize("FF15.Types.Item.Types.Options.Limitation.thrice") },
  ];
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
  .flexcol.flex3.left.high
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
        .flex2
          label(for="modType") Modifier Type
        .flex2.right
          DocSelect.right(id="modType" name="modType" options="{modOptions}" valuePath="system.modType")
      .flexrow.sheet-row.justify-vertical
        .flex2
          label(for="operator") Operator
        .flex2.right
          DocSelect.right(id="operator" name="operator" options="{operatorOptions}" valuePath="system.operator")
      .flexrow.sheet-row.justify-vertical
        .flex2
          label(for="modAmount") Amount
        .flex2.right
          DocInput(id="modAmount" name="modAmount" valuePath="system.modAmount")
  
</template>

<style lang="sass">
  @import '../../../../../../styles/Mixins.sass'

  .details
    height: calc(100% - 0px)
    +inset
</style>
