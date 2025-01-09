<script>
  import { onMount, getContext } from "svelte";
  import { isParentActor} from "~/src/helpers/util";
  import { localize } from "#runtime/util/i18n";
  import { PCModel } from "~/src/models/actors/PC.js";
  import { getRangeOptions } from "~/src/helpers/constants.js";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
  import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";
  import DocCheckbox from "~/src/components/atoms/controls/DocCheckbox.svelte";


  const item = getContext("#doc");

  const { HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField } =
    foundry.data.fields;

  const schemaFields = PCModel.schema.fields.attributes.fields.primary.fields;
  const schemaFieldEntries = Object.entries(schemaFields);
  const schemaFieldKeys = Object.keys(schemaFields).filter((key) => schemaFields[key] instanceof SchemaField);
  const schemaFieldObjects = schemaFieldEntries
    .filter(([key, value]) => value instanceof SchemaField)
    .map(([key, value]) => ({ key, value }));

  const targetOptions = [
    { value: "single", label: localize("FF15.Types.Item.Types.Options.Target.single") },
    { value: "enemy", label: localize("FF15.Types.Item.Types.Options.Target.enemy") },
    { value: "all", label: localize("FF15.Types.Item.Types.Options.Target.all") },
    { value: "ally", label: localize("FF15.Types.Item.Types.Options.Target.ally") },
  ];
  const triggerOptions = [
    { value: "any", label: localize("FF15.Types.Item.Types.Options.Trigger.any") },
    { value: "ability", label: localize("FF15.Types.Item.Types.Options.Trigger.ability") },
    { value: "move", label: localize("FF15.Types.Item.Types.Options.Trigger.move") },
    { value: "turn", label: localize("FF15.Types.Item.Types.Options.Trigger.turn") },
    { value: "invoke", label: localize("FF15.Types.Item.Types.Options.Trigger.invoke") },
  ];


  const rangeOptions = getRangeOptions();

  

  $: parentIsActor = isParentActor($item);
  $: checkOptions = schemaFieldKeys.map((key) => ({ value: key, label: key.toUpperCase() }));
  $: if(!$item.system.hasTrigger) {
    $item.update({system: {trigger: null}})
  }

</script>

<template lang="pug">
.item-sheet.details.overflow.wide
  .flexcol.flex3.left.high.wide
    h3.left General

    .flexrow.sheet-row.justify-vertical
      .flex4
        h3.left Range
      .flex0.right
        DocCheckbox( name="hasRanged" valuePath="system.hasRanged")
    +if("$item.system.hasRanged")

      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="rangeType") Range Type
        .flex4.right.wide
          DocSelect.right.wide(id="rangeType" name="rangeType" options="{rangeOptions}" valuePath="system.rangeType")
    .flexrow.sheet-row.justify-vertical
      .flex4
        h3.left Target
      .flex0.right
        DocCheckbox(id="hasTarget" name="hasTarget" valuePath="system.hasTarget")

    +if("$item.system.hasTarget")
      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="target") Target
        .flex4.right.wide
          DocSelect.right.wide(id="target" name="target" options="{targetOptions}" valuePath="system.target")

    .flexrow.justify-vertical
      .flex4
        h3.left Trigger
      .flex0.right
        DocCheckbox( name="hasTrigger" valuePath="system.hasTrigger")

    +if("$item.system.hasTrigger")
      .flexrow.sheet-row.justify-vertical.wide
        .flex1
          label(for="trigger") Trigger
        .flex4.right.wide(style="max-width: 100%")
          DocSelect.right.wide(id="trigger" name="trigger" type="number" options="{triggerOptions}" valuePath="system.trigger")

    .flexrow.sheet-row.justify-vertical
      .flex2.wide
        label.h3.underline.wide.gold(for="directHitDamage") Base Effect 
        .item-tabs.high
    .flexcol.flex3.left.prose.editor-inset.high
        ProseMirror( attr="system.baseEffect")

</template>

<style lang="sass">
    @use '../../../../../../styles/_mixins' as mixins
  

    .details
      height: calc(100%)
      +mixins.inset(1rem)
</style>
