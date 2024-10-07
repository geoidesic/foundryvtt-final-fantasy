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
  const CROptions = [
    { value: "def", label: "Defence" },
    { value: "mag", label: "Magic Defence" },
    { value: "vig", label: "Vigilance" },
    { value: "spd", label: "Speed" },
  ];
  const targetOptions = [
    { value: "single", label: "Single" },
    { value: "enemy", label: "The enemy that triggered this ability" },
    { value: "all", label: "All enemies within range" },
    { value: "ally", label: "Ally" },
  ]
  const limitationOptions = [
    { value: "once", label: "Once per phase" },
    { value: "twice", label: "Twice per phase" },
    { value: "thrice", label: "Thrice per phase" },
  ]
  const heavyshotOptions = [
    { value: "straignt", label: "Grants Straight Shot Ready" }
  ]

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
              DocSelect.right( name="checkAttribute" options="{checkOptions}" valuePath="system.checkAttribute")

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
              DocSelect.right( name="directHitType" options="{directHitOptions}" valuePath="system.directHitType")

        +if("$item.system.directHitType === 'damage'")
          .flexrow.sheet-row
            .flex2
              label Direct Hit Damage 
            .flex2.right
              DocInput( name="directHitDamage" valuePath="system.directHitDamage")

        h3.left CR
        .flexrow.justify-flexrow-vertical
          .flex2
            label Has CR?
          .flex2.right
            DocCheckbox( name="hasCR" valuePath="system.hasCR")

        +if("$item.system.hasCR")
          .flexrow.sheet-row.justify-flexrow-vertical
            .flex2
              label CR Type
            .flex2.right
              DocSelect.right( name="CR" options="{CROptions}" valuePath="system.CR")

        h3.left Heavier Shot
        .flexrow.justify-flexrow-vertical
          .flex2
            label Heavier Shot?
          .flex2.right
            DocCheckbox( name="hasHeavierShot" valuePath="system.hasHeavierShot")

        +if("$item.system.hasHeavierShot")
          .flexrow.sheet-row.justify-flexrow-vertical
            .flex2
              label Heavier Shot Type
            .flex2.right
              DocSelect.right( name="heavierShot" options="{heavyshotOptions}" valuePath="system.heavierShot")

        h3.left Target
        .flexrow.justify-flexrow-vertical
          .flex2
            label Has Target?
          .flex2.right
            DocCheckbox( name="hasTarget" valuePath="system.hasTarget")

        +if("$item.system.hasTarget")
          .flexrow.sheet-row.justify-flexrow-vertical
            .flex2
              label Target
            .flex2.right
              DocSelect.right( name="target" options="{targetOptions}" valuePath="system.target")

        h3.left Limitation
        .flexrow.justify-flexrow-vertical
          .flex2
            label Has Limitation?
          .flex2.right
            DocCheckbox( name="hasLimitation" valuePath="system.hasLimitation")

        +if("$item.system.hasLimitation")
          .flexrow.sheet-row.justify-flexrow-vertical
            .flex2
              label Limitation
            .flex2.right
              DocSelect.right( name="limitation" type="number" options="{limitationOptions}" valuePath="system.limitation")

        h3.left Extras
        .flexrow.sheet-row
          .flex2
            label Trigger
          .flex2.right
            DocInput( name="trigger" valuePath="system.trigger")
            
        .flexrow.sheet-row
          .flex2
            label Heavier Shot
          .flex2.right
            DocInput( name="heavierShot" valuePath="system.heavierShot")

        h3.left Base Effect
          .prose
            ProseMirror( attr="system.baseEffect" )
</template>

<style lang="sass">
    @import '../../../../../../styles/Mixins.sass'
    .details
      @include inset
</style>
