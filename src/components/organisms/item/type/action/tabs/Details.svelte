<script>
  import { onMount, getContext } from "svelte";
  import { localize } from "~/src/helpers/util";
  import { 
    getRangeOptions, getDurationOptions, getDurationTypeOptions, getDurationUnits, getDurationQualifierOptions,
    getLimitationOptions, getLimitationUnits, getAspectedOptions, 
    getTargetOptions, getHeavyshotOptions, getTriggerOptions, 
    getDirectHitOptions, getTypeOptions, getBaseEffectHealingTypeOptions
  } from "~/src/helpers/constants.js";
  import { getCROptions } from "~/src/helpers/constants.js";
  import { PCModel } from "~/src/models/actors/PC.js";
  import { getDefaultStatusEffects } from "~/src/helpers/Conditions.js";

  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
  import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";
  import DocCheckbox from "~/src/components/atoms/controls/DocCheckbox.svelte";
  import DurationComponent from "~/src/components/molecules/Item/Duration.svelte";
  
  const item = getContext("#doc");

  game.system.log.d("Details", item.system);
  game.system.log.d("PCModel", PCModel.schema.fields.attributes.fields.primary.fields);
  const { HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField } =
    foundry.data.fields;

  const schemaFields = PCModel.schema.fields.attributes.fields.primary.fields;
  const schemaFieldEntries = Object.entries(schemaFields);
  const schemaFieldKeys = Object.keys(schemaFields).filter((key) => schemaFields[key] instanceof SchemaField);
  const schemaFieldObjects = schemaFieldEntries
    .filter(([key, value]) => value instanceof SchemaField)
    .map(([key, value]) => ({ key, value }));

  const CROptions = getCROptions();
  const limitationOptions = getLimitationOptions();
  const limitationUnitsOptions = getLimitationUnits();
  const durationOptions = getDurationOptions();
  const durationUnitsOptions = getDurationUnits();
  const rangeOptions = getRangeOptions();
  const heavyshotOptions = getHeavyshotOptions();
  const triggerOptions = getTriggerOptions();
  const targetOptions = getTargetOptions();
  const aspectedOptions = getAspectedOptions();
  const typeOptions = getTypeOptions();
  const directHitConditionOptions = getDefaultStatusEffects().map((effect) => ({ value: effect.id, label: effect.name }));
  const baseEffectHealingTypeOptions = getBaseEffectHealingTypeOptions();
  const durationQualifierOptions = getDurationQualifierOptions();
  const durationTypeOptions = getDurationTypeOptions();
  const directHitOptions = getDirectHitOptions();

  const costOptions = [
    { value: 1, label: localize("Types.Item.Types.Options.Cost.1") },
    { value: 2, label: localize("Types.Item.Types.Options.Cost.2") },
    { value: 3, label: localize("Types.Item.Types.Options.Cost.3") },
    { value: 4, label: localize("Types.Item.Types.Options.Cost.4") },
  ];

  console.log(schemaFieldObjects);

  $: checkOptions = [
    ...schemaFieldKeys.map((key) => ({ value: key, label: key.toUpperCase() })),
    { value: "critical", label: localize("Types.Item.Types.Options.Check.critical") }
  ];
  $: if(!$item.system.hasTrigger) {
    $item.update({system: {trigger: null}})
  }

</script>

<template lang="pug">
  .item-sheet.details.overflow.wide
    .flexcol.flex3.left.high.wide
      h3.left {localize("General")}
      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="type") {localize("Type")}
        .flex4.right.wide
          DocSelect.wide.right(id="type" name="type" type="number" options="{typeOptions}" valuePath="system.type")
      

      .flexrow.justify-vertical
        .flex4 
          +if("$item.system.hasBaseEffect")
            h2.left {localize("Types.Item.Types.action.BaseEffect")}
            +else
              h3.left {localize("Types.Item.Types.action.BaseEffect")}
        
        .flex0.right
          DocCheckbox( name="hasBaseEffect" valuePath="system.hasBaseEffect")
      +if("$item.system.hasBaseEffect")
        .subsection
          .flexrow.justify-vertical
            .flex4
              h3.left {localize("Types.Item.Types.action.BaseEffectBarrier")}
            .flex0.right
              DocCheckbox( name="hasBaseEffectBarrier" valuePath="system.hasBaseEffectBarrier")
          +if("$item.system.hasBaseEffectBarrier")
            .flexrow.sheet-row.justify-vertical.px-sm
              .flex3
                label(for="baseEffectBP") {localize("Types.Actor.Points.BP.Label")}
              .flex2.right
                DocInput(id="baseEffectBP" name="baseEffectBP" valuePath="system.baseEffectBP")
          .flexrow.justify-vertical
            .flex4
              h3.left {localize("Types.Item.Types.action.BaseEffectDamage")}
            .flex0.right
              DocCheckbox( name="hasBaseEffectDamage" valuePath="system.hasBaseEffectDamage")
          +if("$item.system.hasBaseEffectDamage")
            .flexrow.sheet-row.justify-vertical.px-sm
              .flex3
                label(for="baseEffectDamage") {localize("Damage")}
              .flex2.right
                DocInput(id="baseEffectDamage" name="baseEffectDamage" valuePath="system.baseEffectDamage")

          .flexrow.justify-vertical
            .flex4
              h3.left {localize("Types.Item.Types.action.BaseEffectHealing")}
            .flex0.right
              DocCheckbox( name="hasBaseEffectHealing" valuePath="system.hasBaseEffectHealing")
          +if("$item.system.hasBaseEffectHealing")
            .flexrow.sheet-row.justify-vertical.px-sm
              .flex3
                label(for="baseEffectHealing") {localize("Type")}
              .flex4.right
                DocSelect.wide.right(id="baseEffectHealingType" name="baseEffectHealingType" options="{baseEffectHealingTypeOptions}" valuePath="system.baseEffectHealingType")
            .flexrow.sheet-row.justify-vertical.px-sm
              .flex3
                label(for="baseEffectHealing") {localize("Amount")}
              .flex4.right
                DocInput(id="baseEffectHealing" name="baseEffectHealing" valuePath="system.baseEffectHealing")
          

          .flexrow.justify-vertical
            .flex4
              h3.left {localize("Types.Item.Types.action.BaseEffectRestoreMP")}
            .flex0.right
              DocCheckbox( name="hasBaseEffectRestoreMP" valuePath="system.hasBaseEffectRestoreMP")
          +if("$item.system.hasBaseEffectRestoreMP")
            .flexrow.sheet-row.justify-vertical.px-sm
              .flex3
                label(for="baseEffectRestoreMP") {localize("Types.Item.Types.action.BaseEffectRestoreMP")}
              .flex2.right
                DocInput(id="baseEffectRestoreMP" name="baseEffectRestoreMP" valuePath="system.baseEffectRestoreMP")



      
      .flexrow.justify-vertical
        .flex4
          h3.left {localize("Types.Item.Target")}
        .flex0.right
          DocCheckbox(id="hasTarget" name="hasTarget" valuePath="system.hasTarget")

      +if("$item.system.hasTarget")
        .flexrow.sheet-row.justify-vertical.wide
          .flex1
            label(for="target") {localize("Type")}
          .flex4.right.wide
            DocSelect.wide.right(id="target" name="target" options="{targetOptions}" valuePath="system.target")
      
      .flexrow.justify-vertical
        .flex4
          h3.left {localize("Types.Item.Range")}
        .flex0.right
          DocCheckbox( name="hasRanged" valuePath="system.hasRanged")
      +if("$item.system.hasRanged")

        .flexrow.sheet-row.justify-vertical.wide
            .flex1
              label(for="rangeType") {localize("Type")}
            .flex4.right.wide
              DocSelect.wide.right.wide(id="rangeType" name="rangeType" options="{rangeOptions}" valuePath="system.rangeType")
      .flexrow.justify-vertical
        .flex4
          h3.left Checks
        .flex0.right
          DocCheckbox( name="hasCheck" valuePath="system.hasCheck")

      +if("$item.system.hasCheck")
        .flexrow.sheet-row.justify-vertical.wide
          .flex2
            label(for="checkAttribute") {localize("Check")} {localize("Attribute")}
          .flex4.right.wide
            DocSelect.wide.right(id="checkAttribute" name="checkAttribute" options="{checkOptions}" valuePath="system.checkAttribute")


      .flexrow.justify-vertical
        .flex4
          h3.left {localize("CR")}
        .flex0.right
          DocCheckbox( name="hasCR" valuePath="system.hasCR")

      +if("$item.system.hasCR")
        .flexrow.sheet-row.justify-vertical.wide
          .flex1
            label(for="CR") {localize("Type")}
          .flex4.right.wide
            DocSelect.wide.right(id="CR" name="CR" options="{CROptions}" valuePath="system.CR")
      



      .flexrow.justify-vertical
        .flex4
          h3.left {localize("Limitation")}
        .flex0.right
          DocCheckbox( name="hasLimitation" valuePath="system.hasLimitation")

      +if("$item.system.hasLimitation")
        .flexrow.sheet-row.justify-vertical.wide
          .flex2.left
            DocSelect.left(id="limitation" name="limitation" type="number" options="{limitationOptions}" valuePath="system.limitation")
          .flex2.right
            DocSelect.right(id="limitationUnits" name="limitationUnits" options="{limitationUnitsOptions}" valuePath="system.limitationUnits")

      DurationComponent

      .flexrow.justify-vertical
        .flex4
          h3.left {localize("Aspected")}
        .flex0.right
          DocCheckbox( name="hasAspected" valuePath="system.hasAspected")
      +if("$item.system.hasAspected")
        .flexrow.sheet-row.justify-vertical.wide
          .flex1
            label(for="aspected") {localize("Aspected")}
          .flex4.right.wide
            DocSelect.wide.right(id="aspected" name="aspected" type="number" options="{aspectedOptions}" valuePath="system.aspected")

      .flexrow.justify-vertical
        .flex4
          h3.left {localize("Types.Item.Trigger")}
        .flex0.right
          DocCheckbox( name="hasTrigger" valuePath="system.hasTrigger")

      +if("$item.system.hasTrigger")
        .flexrow.sheet-row.justify-vertical.wide
          .flex1
            label(for="trigger") {localize("Type")}
          .flex4.right.wide
            DocSelect.wide.right(id="trigger" name="trigger" type="number" options="{triggerOptions}" valuePath="system.trigger")
    
      

      .flexrow.justify-vertical
        .flex4
          h3.left {localize("Cost")}
        .flex0.right
          DocCheckbox( name="hasCostMP" valuePath="system.hasCostMP")

      +if("$item.system.hasCostMP")
        .flexrow.sheet-row.justify-vertical.wide
          .flex1
            label(for="cost") {localize("Types.Actor.Points.MP.short")}
          .flex4.right.wide
            DocSelect.wide.right(id="cost" name="cost" type="number" options="{costOptions}" valuePath="system.costMP")
      

      .flexrow.justify-vertical
        .flex4
          h3.left {localize("HeavierShot")}
        .flex0.right
          DocCheckbox( name="hasHeavierShot" valuePath="system.hasHeavierShot")

      .flexrow.justify-vertical
        .flex4
          h3.left {localize("Types.Item.Types.action.SplitDamage")}
        .flex0.right
          DocCheckbox(name="hasSplitDamage" valuePath="system.hasSplitDamage")

      .flexrow.justify-vertical
        .flex4
          h3.left {localize("Types.Item.Types.action.DirectHit")}
        .flex0.right
          DocCheckbox( name="hasDirectHit" valuePath="system.hasDirectHit")

      +if("$item.system.hasDirectHit")
        .flexrow.sheet-row.justify-vertical.wide
          .flex1
            label(for="directHitType") {localize("Type")}
          .flex4.right.wide
            DocSelect.wide.right(id="directHitType" name="directHitType" options="{directHitOptions}" valuePath="system.directHitType")

      +if("$item.system.directHitType === 'damage'")
        .flexrow.sheet-row.justify-vertical
          .flex2
            label(for="directHitDamage") {localize("Damage")}
          .flex2.right
            DocInput(id="directHitDamage" name="directHitDamage" valuePath="system.directHitDamage")

      +if("$item.system.directHitType === 'condition'")
        .flexrow.sheet-row.justify-vertical.wide
          .flex2
            label(for="directHitCondition") {localize("Condition")}
          .flex2.right.wide
            DocSelect.wide.right(id="directHitCondition" name="directHitCondition" options="{directHitConditionOptions}" valuePath="system.directHitCondition")

      +if("$item.system.hasDirectHit")
        .flexcol.sheet-row.justify-vertical.high
          .flex2
            h3.left {localize("Types.Item.Types.action.DirectHit")} {localize("Text")} 
          .flex2.left.prose.high
            ProseMirror( id="directHitText" name="directHitText" attr="system.directHitText")


</template>

<style lang="sass">
    @use '../../../../../../styles/_mixins' as mixins
    label
      color: var(--color-highlight)
    .details
      max-height: calc(100% - 15px) //- prevents the scrolling area's content from being hidden below the fold

      +mixins.inset(1rem)

    .subsection
      +mixins.inset(0.5rem)
      margin-bottom: 0.5rem
</style>
