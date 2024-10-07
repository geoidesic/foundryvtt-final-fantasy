<script>
  import { onMount, getContext } from "svelte";
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
    { value: "damage", label: "Damage" },
    { value: "markers", label: "Remove Markers" },
  ];

  console.log(schemaFieldObjects);

  $: checkOptions = schemaFieldKeys.map((key) => ({ value: key, label: key.toUpperCase() }));
</script>

<template lang="pug">
    .item-sheet.details
      .flexcol.flex3.left
        h3.left Range
        .flexrow.justify-flexrow-vertical
          .flex2
            label Is Ranged?
          .flex2.right
            DocCheckbox( name="ranged" valuePath="system.ranged")
        +if("$item.system.ranged")
          .flexrow.sheet-row
            .flex2
              label Range value
            .flex2.right
              DocInput( name="rangeValue" type="number" valuePath="system.rangeValue")
          .flexrow.sheet-row
            .flex2
              label Range type
            .flex2.right
              DocInput( name="rangeType" valuePath="system.rangeType")

        h3.left Checks
        .flexrow.justify-flexrow-vertical
          .flex2
            label Has Check?
          .flex2.right
            DocCheckbox( name="hasCheck" valuePath="system.hasCheck")

        +if("$item.system.hasCheck")
          .flexrow.sheet-row.justify-flexrow-vertical
            .flex2
              label Check Attribute
            .flex2.right
              DocSelect( name="checkAttribute" options="{checkOptions}" valuePath="system.checkAttribute")

        h3.left Direct Hit
        .flexrow.justify-flexrow-vertical
          .flex2
            label Has Direct Hit?
          .flex2.right
            DocCheckbox( name="hasDirectHit" valuePath="system.hasDirectHit")

        +if("$item.system.hasDirectHit")
          .flexrow.sheet-row.justify-flexrow-vertical
            .flex2
              label Direct Hit Type
            .flex2.right
              DocSelect( name="directHitType" options="{directHitOptions}" valuePath="system.directHitType")

        +if("$item.system.directHitType === 'damage'")
          .flexrow.sheet-row
            .flex2
              label Direct Hit Damage 
            .flex2.right
              DocInput( name="directHitDamage" valuePath="system.directHitDamage")

        h3.left Extras
        .flexrow.sheet-row
          .flex2
            label Trigger
          .flex2.right
            DocInput( name="trigger" valuePath="system.trigger")
        .flexrow.sheet-row
          .flex2
            label Target
          .flex2.right
            DocInput( name="target" valuePath="system.target")
        .flexrow.sheet-row
          .flex2
            label Direct Hit
          .flex2.right
            DocInput( name="directHit" valuePath="system.directHit")
        .flexrow.sheet-row
          .flex2
            label Heavier Shot
          .flex2.right
            DocInput( name="heavierShot" valuePath="system.heavierShot")
        .flexrow.sheet-row
          .flex2
            label Limitation
          .flex2.right
            DocInput( name="limitation" valuePath="system.limitation")

        h3.left Base Effect
          .prose
            ProseMirror( attr="system.baseEffect" )
</template>

<style lang="sass">
    @import '../../../../../../styles/Mixins.sass'
    .details
      @include inset
</style>
