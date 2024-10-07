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
  const triggerOptions = [
    { value: "afterCheck", label: "Immediately after an enemy makes an ability check" },
    { value: "beforeMove", label: "Immediately before an enemy moves" },
    { value: "afterTurn", label: "When any character finishes their turn" },
    { value: "invoke", label: "When an enemy within 10 squares of this character uses an invoked ability, or is using an invoked ability to generate a marker" },
  ]
  const rangeOptions = [
    { value: "1sq", label: "1 Square" },
    { value: "5sq", label: "5 Squares" },
    { value: "10sq", label: "10 Squares" },
    { value: "3x3a", label: "A 3x3 area centered on this character" },
    { value: "5x5a", label: "A 5x5 area centered on this character" },
  ]

  console.log(schemaFieldObjects);

  $: checkOptions = schemaFieldKeys.map((key) => ({ value: key, label: key.toUpperCase() }));
</script>

<template lang="pug">
    .item-sheet.details
      .flexcol.flex3.left
        .flexrow.justify-flexrow-vertical
          .flex4
            h3.left Checks
          .flex0.right
            DocCheckbox( name="hasCheck" valuePath="system.hasCheck")

        +if("$item.system.hasCheck")
          .flexrow.sheet-row.justify-flexrow-vertical
            .flex4
              label Check Attribute
            .flex0.right
              DocSelect.right( name="checkAttribute" options="{checkOptions}" valuePath="system.checkAttribute")

        .flexrow.justify-flexrow-vertical
          .flex4
            h3.left CR
          .flex0.right
            DocCheckbox( name="hasCR" valuePath="system.hasCR")

        +if("$item.system.hasCR")
          .flexrow.sheet-row.justify-flexrow-vertical
            .flex2
              label CR Type
            .flex2.right
              DocSelect.right( name="CR" options="{CROptions}" valuePath="system.CR")
        .flexrow.justify-flexrow-vertical
          .flex4
            h3.left Direct Hit
          .flex0.right
            DocCheckbox( name="hasDirectHit" valuePath="system.hasDirectHit")

        +if("$item.system.hasDirectHit")
          .flexrow.sheet-row.justify-flexrow-vertical
            .flex4
              label Direct Hit Type
            .flex0.right
              DocSelect.right( name="directHitType" options="{directHitOptions}" valuePath="system.directHitType")

        +if("$item.system.directHitType === 'damage'")
          .flexrow.sheet-row
            .flex2
              label Direct Hit Damage 
            .flex2.right
              DocInput( name="directHitDamage" valuePath="system.directHitDamage")

        .flexrow.justify-flexrow-vertical
          .flex4
            h3.left Heavier Shot
          .flex0.right
            DocCheckbox( name="hasHeavierShot" valuePath="system.hasHeavierShot")

        +if("$item.system.hasHeavierShot")
          .flexrow.sheet-row.justify-flexrow-vertical
            .flex2
              label Heavier Shot Type
            .flex2.right
              DocSelect.right( name="heavierShot" options="{heavyshotOptions}" valuePath="system.heavierShot")

        .flexrow.justify-flexrow-vertical
          .flex4
            h3.left Limitation
          .flex0.right
            DocCheckbox( name="hasLimitation" valuePath="system.hasLimitation")

        +if("$item.system.hasLimitation")
          .flexrow.sheet-row.justify-flexrow-vertical
            .flex2
              label Limitation
            .flex2.right
              DocSelect.right( name="limitation" type="number" options="{limitationOptions}" valuePath="system.limitation")
        .flexrow.justify-flexrow-vertical
          .flex4
            h3.left Range
          .flex0.right
            DocCheckbox( name="hasRanged" valuePath="system.hasRanged")
        +if("$item.system.hasRanged")

          .flexrow.sheet-row.justify-flexrow-vertical
              .flex2
                label Range Type
              .flex2.right
                DocSelect.right( name="rangeType" options="{rangeOptions}" valuePath="system.rangeType")
        .flexrow.justify-flexrow-vertical
          .flex4
            h3.left Target
          .flex0.right
            DocCheckbox( name="hasTarget" valuePath="system.hasTarget")

        +if("$item.system.hasTarget")
          .flexrow.sheet-row.justify-flexrow-vertical
            .flex2
              label Target
            .flex2.right
              DocSelect.right( name="target" options="{targetOptions}" valuePath="system.target")


        .flexrow.justify-flexrow-vertical
          .flex4
            h3.left Trigger
          .flex0.right
            DocCheckbox( name="hasTrigger" valuePath="system.hasTrigger")

        +if("$item.system.hasTrigger")
          .flexrow.sheet-row.justify-flexrow-vertical
            .flex2
              label Trigger
            .flex2.right
              DocSelect.right( name="trigger" type="number" options="{triggerOptions}" valuePath="system.trigger")


</template>

<style lang="sass">
    @import '../../../../../../styles/Mixins.sass'
    .details
      @include inset
</style>
