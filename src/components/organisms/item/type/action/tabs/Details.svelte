<script>
  import { onMount, getContext } from "svelte";
  import { localize } from "#runtime/svelte/helper";
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
    { value: "vig", label: localize("FF15.Types.Item.Types.Options.CR.vig") },
    { value: "spd", label: localize("FF15.Types.Item.Types.Options.CR.spd") },
    { value: "special", label: localize("FF15.Types.Item.Types.Options.CR.special") },
  ];

  const targetOptions = [
    { value: "single", label: localize("FF15.Types.Item.Types.Options.Target.single") },
    { value: "enemy", label: localize("FF15.Types.Item.Types.Options.Target.enemy") },
    { value: "all", label: localize("FF15.Types.Item.Types.Options.Target.all") },
    { value: "ally", label: localize("FF15.Types.Item.Types.Options.Target.ally") },
  ];

  const limitationOptions = [
    { value: "once", label: localize("FF15.Types.Item.Types.Options.Limitation.once") },
    { value: "twice", label: localize("FF15.Types.Item.Types.Options.Limitation.twice") },
    { value: "thrice", label: localize("FF15.Types.Item.Types.Options.Limitation.thrice") },
  ];

  const heavyshotOptions = [{ value: "straignt", label: localize("FF15.Types.Item.Types.Options.Heavyshot.straignt") }];

  const triggerOptions = [
    { value: "ability", label: localize("FF15.Types.Item.Types.Options.Trigger.afterCheck") },
    { value: "move", label: localize("FF15.Types.Item.Types.Options.Trigger.beforeMove") },
    { value: "turn", label: localize("FF15.Types.Item.Types.Options.Trigger.afterTurn") },
    { value: "invoke", label: localize("FF15.Types.Item.Types.Options.Trigger.invoke") },
  ];

  const rangeOptions = [
    { value: "1sq", label: localize("FF15.Types.Item.Types.Options.Range.1sq") },
    { value: "5sq", label: localize("FF15.Types.Item.Types.Options.Range.5sq") },
    { value: "10sq", label: localize("FF15.Types.Item.Types.Options.Range.10sq") },
    { value: "3x3a", label: localize("FF15.Types.Item.Types.Options.Range.3x3a") },
    { value: "5x5a", label: localize("FF15.Types.Item.Types.Options.Range.5x5a") },
  ];

  console.log(schemaFieldObjects);

  $: checkOptions = schemaFieldKeys.map((key) => ({ value: key, label: key.toUpperCase() }));
  $: if(!$item.system.hasTrigger) {
    $item.update({system: {trigger: null}})
  }

</script>

<template lang="pug">
    .item-sheet.details
      .flexcol.flex3.left
        .flexrow.justify-vertical
          .flex4
            h3.left Checks
          .flex0.right
            DocCheckbox( name="hasCheck" valuePath="system.hasCheck")

        +if("$item.system.hasCheck")
          .flexrow.sheet-row.justify-vertical
            .flex4
              label(for="checkAttribute") Check Attribute
            .flex0.right
              DocSelect.right(id="checkAttribute" name="checkAttribute" options="{checkOptions}" valuePath="system.checkAttribute")

        .flexrow.justify-vertical
          .flex4
            h3.left CR
          .flex0.right
            DocCheckbox( name="hasCR" valuePath="system.hasCR")

        +if("$item.system.hasCR")
          .flexrow.sheet-row.justify-vertical
            .flex2
              label(for="CR") CR Type
            .flex2.right
              DocSelect.right(id="CR" name="CR" options="{CROptions}" valuePath="system.CR")
        .flexrow.justify-vertical
          .flex4
            h3.left Direct Hit
          .flex0.right
            DocCheckbox( name="hasDirectHit" valuePath="system.hasDirectHit")

        +if("$item.system.hasDirectHit")
          .flexrow.sheet-row.justify-vertical
            .flex4
              label(for="directHitType") Direct Hit Type
            .flex0.right
              DocSelect.right(id="directHitType" name="directHitType" options="{directHitOptions}" valuePath="system.directHitType")

        +if("$item.system.directHitType === 'damage'")
          .flexrow.sheet-row
            .flex2
              label(for="directHitDamage") Direct Hit Damage 
            .flex2.right
              DocInput(id="directHitDamage" name="directHitDamage" valuePath="system.directHitDamage")

        .flexrow.justify-vertical
          .flex4
            h3.left Heavier Shot
          .flex0.right
            DocCheckbox( name="hasHeavierShot" valuePath="system.hasHeavierShot")

        +if("$item.system.hasHeavierShot")
          .flexrow.sheet-row.justify-vertical
            .flex2
              label(for="heavierShot") Heavier Shot Type
            .flex2.right
              DocSelect.right(id="heavierShot" name="heavierShot" options="{heavyshotOptions}" valuePath="system.heavierShot")

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
              DocSelect.right(id="limitation" name="limitation" type="number" options="{limitationOptions}" valuePath="system.limitation")
        .flexrow.justify-vertical
          .flex4
            h3.left Range
          .flex0.right
            DocCheckbox( name="hasRanged" valuePath="system.hasRanged")
        +if("$item.system.hasRanged")

          .flexrow.sheet-row.justify-vertical
              .flex2
                label(for="rangeType") Range Type
              .flex2.right
                DocSelect.right(id="rangeType" name="rangeType" options="{rangeOptions}" valuePath="system.rangeType")
        .flexrow.justify-vertical
          .flex4
            h3.left Target
          .flex0.right
            DocCheckbox(id="hasTarget" name="hasTarget" valuePath="system.hasTarget")

        +if("$item.system.hasTarget")
          .flexrow.sheet-row.justify-vertical
            .flex2
              label(for="target") Target
            .flex2.right
              DocSelect.right(id="target" name="target" options="{targetOptions}" valuePath="system.target")


        .flexrow.justify-vertical
          .flex4
            h3.left Trigger
          .flex0.right
            DocCheckbox( name="hasTrigger" valuePath="system.hasTrigger")

        +if("$item.system.hasTrigger")
          .flexrow.sheet-row.justify-vertical
            .flex2
              label(for="trigger") Trigger
            .flex2.right
              DocSelect.right(id="trigger" name="trigger" type="number" options="{triggerOptions}" valuePath="system.trigger")


</template>

<style lang="sass">
    @import '../../../../../../styles/Mixins.sass'
    .details
      @include inset
</style>
