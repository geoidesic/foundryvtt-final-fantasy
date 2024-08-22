import { FFActorDataModel } from './baseActor';
import { localize } from "#runtime/svelte/helper";

const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField
} = foundry.data.fields;

export class PCModel extends FFActorDataModel {
  static defineSchema() {
    return {
      isEditing: new BooleanField({initial: false}),
      biography: new HTMLField(),
      points: new SchemaField({
        MP: new SchemaField({
          current: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
          max: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
        }),
        HP: new SchemaField({
          current: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
          max: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
        }),
        BP: new SchemaField({
          current: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
          max: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
        })
      }),
      attributes: new SchemaField({
        primary: new SchemaField({
          str: new SchemaField({
            //- @deprecated: I think `label` is in the wrong place? Should maybe just be in the svelte template as it is a constant, not data
            // label: new StringField({ initial: localize('FF15.Types.Actor.Types.PC.Attributes.Primary.str.Label') }),
            val: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
            mod: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
          }),
          dex: new SchemaField({
            // label: new StringField({ initial: localize('FF15.Types.Actor.Types.PC.Attributes.Primary.dex.Label') }),
            val: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
            mod: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
          }),
          vit: new SchemaField({
            // label: new StringField({ initial: localize('FF15.Types.Actor.Types.PC.Attributes.Primary.vit.Label') }),
            val: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
            mod: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
          }),
          int: new SchemaField({
            // label: new StringField({ initial: localize('FF15.Types.Actor.Types.PC.Attributes.Primary.ing.Label') }),
            val: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
            mod: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
          }),
          mnd: new SchemaField({
            // label: new StringField({ initial: localize('FF15.Types.Actor.Types.PC.Attributes.Primary.mnd.Label') }),
            val: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
            mod: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
          }),
        }),
        secondary: new SchemaField({
          def: new SchemaField({
            // label: new StringField({ initial: localize('FF15.Types.Actor.Types.PC.Attributes.Primary.def.Label') }),
            val: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
            mod: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
          }),
          mag: new SchemaField({
            // label: new StringField({ initial: localize('FF15.Types.Actor.Types.PC.Attributes.Primary.mag.Label') }),
            val: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
            mod: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
          }),
          vig: new SchemaField({
            // label: new StringField({ initial: localize('FF15.Types.Actor.Types.PC.Attributes.Primary.vig.Label') }),
            val: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
            mod: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
          }),
          spd: new SchemaField({
            // label: new StringField({ initial: localize('FF15.Types.Actor.Types.PC.Attributes.Primary.spd.Label') }),
            val: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
            mod: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
          }),
        })
      })
    }
  }
}