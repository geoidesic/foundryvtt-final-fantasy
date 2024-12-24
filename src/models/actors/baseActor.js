import { FFTypeDataModel } from '~/src/models/baseModel';
const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField
} = foundry.data.fields;

export class FFActorDataModel extends FFTypeDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      isEditing: new BooleanField({initial: false}),

      inventoryLocked: new BooleanField({ initial: false }),
      description: new HTMLField(),
      DOT: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      globalCheckMod: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      points: new SchemaField({
        MP: new SchemaField({
          val: new NumberField({ required: true, integer: true, initial: 0 }),
          max: new NumberField({ required: true, integer: true, initial: 0 })
        }),
        HP: new SchemaField({
          val: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
          max: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
        }),
        BP: new SchemaField({
          val: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
          max: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
        })
      }),
      attributes: new SchemaField({
        primary: new SchemaField({
          str: new SchemaField({
            //- @deprecated: I think `label` is in the wrong place? Should maybe just be in the svelte template as it is a constant, not data
            // label: new StringField({ initial: localize('FF15.Types.Actor.Types.PC.Attributes.Primary.str.Label') }),
            val: new NumberField({ required: true, integer: true, initial: 0 }),
            mod: new NumberField({ required: true, integer: true, initial: 0 })
          }),
          dex: new SchemaField({
            // label: new StringField({ initial: localize('FF15.Types.Actor.Types.PC.Attributes.Primary.dex.Label') }),
            val: new NumberField({ required: true, integer: true, initial: 0 }),
            mod: new NumberField({ required: true, integer: true, initial: 0 })
          }),
          vit: new SchemaField({
            // label: new StringField({ initial: localize('FF15.Types.Actor.Types.PC.Attributes.Primary.vit.Label') }),
            val: new NumberField({ required: true, integer: true, initial: 0 }),
            mod: new NumberField({ required: true, integer: true, initial: 0 })
          }),
          int: new SchemaField({
            // label: new StringField({ initial: localize('FF15.Types.Actor.Types.PC.Attributes.Primary.ing.Label') }),
            val: new NumberField({ required: true, integer: true, initial: 0 }),
            mod: new NumberField({ required: true, integer: true, initial: 0 })
          }),
          mnd: new SchemaField({
            // label: new StringField({ initial: localize('FF15.Types.Actor.Types.PC.Attributes.Primary.mnd.Label') }),
            val: new NumberField({ required: true, integer: true, initial: 0 }),
            mod: new NumberField({ required: true, integer: true, initial: 0 })
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
        }),
      })
    }
  }

  /** Check if the actor has any favourited items */
  hasFavouriteItems() {
    return this.parent.items.some(item => item.system.favourite === true);
  }
}