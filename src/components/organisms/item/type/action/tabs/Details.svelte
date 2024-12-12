<script>
  import { onMount, getContext } from "svelte";
  import { localize } from "#runtime/svelte/helper";
  import { getRangeOptions } from "~/src/helpers/constants.js";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
  import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";
  import DocCheckbox from "~/src/components/atoms/controls/DocCheckbox.svelte";

  import { PCModel } from "~/src/models/actors/PC.js";

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

  const directHitOptions = [
    { value: "damage", label: localize("FF15.Types.Item.Types.Options.DirectHit.damage") },
    { value: "markers", label: localize("FF15.Types.Item.Types.Options.DirectHit.markers") },
  ];

  const CROptions = [
    { value: "def", label: localize("FF15.Types.Item.Types.Options.CR.def") },
    { value: "mag", label: localize("FF15.Types.Item.Types.Options.CR.mag") },
    // { value: "vig", label: localize("FF15.Types.Item.Types.Options.CR.vig") },
    // { value: "spd", label: localize("FF15.Types.Item.Types.Options.CR.spd") },
    { value: "heal", label: localize("FF15.Types.Item.Types.Options.CR.heal") },
    { value: "other", label: localize("FF15.Other") },
    { value: "none", label: localize("FF15.None") },
    // { value: "special", label: localize("FF15.Types.Item.Types.Options.CR.special") },
  ];

  const rangeOptions = getRangeOptions();

  const targetOptions = [
    { value: "single", label: localize("FF15.Types.Item.Types.Options.Target.single") },
    { value: "enemy", label: localize("FF15.Types.Item.Types.Options.Target.enemy") },
    { value: "all", label: localize("FF15.Types.Item.Types.Options.Target.all") },
    { value: "ally", label: localize("FF15.Types.Item.Types.Options.Target.ally") },
  ];
  const aspectedOptions = [
    { value: "earth", label: localize("FF15.Types.Item.Types.Options.Aspected.earth") },
    { value: "lightning", label: localize("FF15.Types.Item.Types.Options.Aspected.lightning") },
    { value: "wind", label: localize("FF15.Types.Item.Types.Options.Aspected.wind") },
    { value: "ice", label: localize("FF15.Types.Item.Types.Options.Aspected.ice") },
  ];

  const limitationOptions = [
    { value: "once", label: localize("FF15.Types.Item.Types.Options.Limitation.once") },
    { value: "twice", label: localize("FF15.Types.Item.Types.Options.Limitation.twice") },
    { value: "thrice", label: localize("FF15.Types.Item.Types.Options.Limitation.thrice") },
  ];
  const usesUnitOptions = [
    { value: "turn", label: localize("FF15.Types.Item.Types.Options.UsesUnit.turn") },
    { value: "phase", label: localize("FF15.Types.Item.Types.Options.UsesUnit.phase") },
    { value: "round", label: localize("FF15.Types.Item.Types.Options.UsesUnit.round") },
  ];

  const heavyshotOptions = [{ value: "straignt", label: localize("FF15.Types.Item.Types.Options.Heavyshot.straignt") }];

  const triggerOptions = [
    { value: "any", label: localize("FF15.Types.Item.Types.Options.Trigger.any") },
    { value: "ability", label: localize("FF15.Types.Item.Types.Options.Trigger.ability") },
    { value: "move", label: localize("FF15.Types.Item.Types.Options.Trigger.move") },
    { value: "turn", label: localize("FF15.Types.Item.Types.Options.Trigger.turn") },
    { value: "invoke", label: localize("FF15.Types.Item.Types.Options.Trigger.invoke") },
  ];


  const typeOptions = [
    { value: "primary", label: localize("FF15.Types.Item.Types.Options.Type.primary") },
    { value: "secondary", label: localize("FF15.Types.Item.Types.Options.Type.secondary") },
    { value: "reaction", label: localize("FF15.Types.Item.Types.Options.Type.reaction") },
    { value: "limit", label: localize("FF15.Types.Item.Types.Options.Type.limit") },
    { value: "combo", label: localize("FF15.Types.Item.Types.Options.Type.combo") },
  ];

  const costOptions = [
    { value: 1, label: localize("FF15.Types.Item.Types.Options.Cost.1") },
    { value: 2, label: localize("FF15.Types.Item.Types.Options.Cost.2") },
    { value: 3, label: localize("FF15.Types.Item.Types.Options.Cost.3") },
    { value: 4, label: localize("FF15.Types.Item.Types.Options.Cost.4") },
  ];

  console.log(schemaFieldObjects);

  $: checkOptions = schemaFieldKeys.map((key) => ({ value: key, label: key.toUpperCase() }));
  $: if(!$item.system.hasTrigger) {
    $item.update({system: {trigger: null}})
  }

</script>

<template lang="pug">
  .item-sheet.details.overflow.wide
    .flexcol.flex3.left.high.wide
      h3.left General
      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="type") Type
        .flex4.right.wide
          DocSelect.wide.right(id="type" name="type" type="number" options="{typeOptions}" valuePath="system.type")
      
      .flexrow.sheet-row.justify-vertical
        .flex3
          label(for="formula") Damage / Heal Formula
        .flex2.right
          DocInput(id="formula" name="formula" valuePath="system.formula")

      .flexrow.justify-vertical
        .flex4
          h3.left Aspected
        .flex0.right
          DocCheckbox( name="hasAspected" valuePath="system.hasAspected")

      +if("$item.system.hasAspected")
        .flexrow.sheet-row.justify-vertical.wide
          .flex1
            label(for="aspected") Aspected
          .flex4.right.wide
            DocSelect.wide.right(id="aspected" name="aspected" type="number" options="{aspectedOptions}" valuePath="system.aspected")
      

      .flexrow.justify-vertical
        .flex4
          h3.left Cost
        .flex0.right
          DocCheckbox( name="hasCost" valuePath="system.hasCost")

      +if("$item.system.hasCost")
        .flexrow.sheet-row.justify-vertical.wide
          .flex1
            label(for="cost") MP
          .flex4.right.wide
            DocSelect.wide.right(id="cost" name="cost" type="number" options="{costOptions}" valuePath="system.cost")
      
      
      .flexrow.justify-vertical
        .flex4
          h3.left Checks
        .flex0.right
          DocCheckbox( name="hasCheck" valuePath="system.hasCheck")

      +if("$item.system.hasCheck")
        .flexrow.sheet-row.justify-vertical.wide
          .flex4
            label(for="checkAttribute") Check Attribute
          .flex2.right.wide
            DocSelect.wide.right(id="checkAttribute" name="checkAttribute" options="{checkOptions}" valuePath="system.checkAttribute")

      .flexrow.justify-vertical
        .flex4
          h3.left CR
        .flex0.right
          DocCheckbox( name="hasCR" valuePath="system.hasCR")

      +if("$item.system.hasCR")
        .flexrow.sheet-row.justify-vertical.wide
          .flex1
            label(for="CR") CR Type
          .flex4.right.wide
            DocSelect.wide.right(id="CR" name="CR" options="{CROptions}" valuePath="system.CR")
      

      .flexrow.justify-vertical
        .flex4
          h3.left Heavier Shot
        .flex0.right
          DocCheckbox( name="hasHeavierShot" valuePath="system.hasHeavierShot")

      +if("$item.system.hasHeavierShot")
        .flexrow.sheet-row.justify-vertical.wide
          .flex1
            label(for="heavierShot") Heavier Shot Type
          .flex4.right.wide
            DocSelect.wide.right(id="heavierShot" name="heavierShot" options="{heavyshotOptions}" valuePath="system.heavierShot")

      .flexrow.justify-vertical
        .flex4
          h3.left Limitation
        .flex0.right
          DocCheckbox( name="hasLimitation" valuePath="system.hasLimitation")

      +if("$item.system.hasLimitation")
        .flexrow.sheet-row.justify-vertical.wide
          .flex1
            label(for="limitation") Limitation
          .flex4.right.wide
            DocSelect.wide.right(id="limitation" name="limitation" type="number" options="{limitationOptions}" valuePath="system.limitation")
      
      .flexrow.justify-vertical
        .flex4
          h3.left Range
        .flex0.right
          DocCheckbox( name="hasRanged" valuePath="system.hasRanged")
      +if("$item.system.hasRanged")

        .flexrow.sheet-row.justify-vertical.wide
            .flex1
              label(for="rangeType") Type
            .flex4.right.wide
              DocSelect.wide.right.wide(id="rangeType" name="rangeType" options="{rangeOptions}" valuePath="system.rangeType")

      .flexrow.justify-vertical
        .flex4
          h3.left Target
        .flex0.right
          DocCheckbox(id="hasTarget" name="hasTarget" valuePath="system.hasTarget")

      +if("$item.system.hasTarget")
        .flexrow.sheet-row.justify-vertical.wide
          .flex1
            label(for="target") Type
          .flex4.right.wide
            DocSelect.wide.right(id="target" name="target" options="{targetOptions}" valuePath="system.target")


      .flexrow.justify-vertical
        .flex4
          h3.left Trigger
        .flex0.right
          DocCheckbox( name="hasTrigger" valuePath="system.hasTrigger")

      +if("$item.system.hasTrigger")
        .flexrow.sheet-row.justify-vertical.wide
          .flex1
            label(for="trigger") Type
          .flex4.right.wide
            DocSelect.wide.right(id="trigger" name="trigger" type="number" options="{triggerOptions}" valuePath="system.trigger")
    
      .flexrow.justify-vertical
        .flex4
          h3.left Uses
        .flex0.right
          DocCheckbox( name="hasUses" valuePath="system.hasUses")

      +if("$item.system.hasUses")
        .flexrow.sheet-row.justify-vertical.wide
          .flex1
            DocInput.wide(id="uses" name="uses" valuePath="system.uses" placeholder="Uses")
          .flex1 per
          .flex4.wide
            DocSelect.wide(id="usesUnit" name="usesUnit" valuePath="system.usesUnit" options="{usesUnitOptions}" placeholder="Units")


      .flexrow.justify-vertical
        .flex4
          h3.left Direct Hit
        .flex0.right
          DocCheckbox( name="hasDirectHit" valuePath="system.hasDirectHit")

      +if("$item.system.hasDirectHit")
        .flexrow.sheet-row.justify-vertical.wide
          .flex1
            label(for="directHitType") Type
          .flex4.right.wide
            DocSelect.wide.right(id="directHitType" name="directHitType" options="{directHitOptions}" valuePath="system.directHitType")

      +if("$item.system.directHitType === 'damage'")
        .flexrow.sheet-row.justify-vertical
          .flex2
            label(for="directHitDamage") Direct Hit Damage 
          .flex2.right
            DocInput(id="directHitDamage" name="directHitDamage" valuePath="system.directHitDamage")

      +if("$item.system.hasDirectHit")
        .flexcol.sheet-row.justify-vertical.high
          .flex2
            h3.left Direct Hit Text 
          .flex2.left.prose.high
            ProseMirror( id="directHitText" name="directHitText" attr="system.directHitText")

</template>

<style lang="sass">
    @import '../../../../../../styles/Mixins.sass'
    .details
      max-height: calc(100% - 15px) //- prevents the scrolling area's content from being hidden below the fold

      +inset(1rem)
</style>
