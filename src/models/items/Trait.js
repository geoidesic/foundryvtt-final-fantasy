import { FFItemDataModel } from './baseItem';

const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField
} = foundry.data.fields;

export class TraitModel extends FFItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),  // Merge with the base model schema
      type: new StringField({ required: false, initial: '' }),
      hasLimitation: new BooleanField({ required: false, initial: false }),
      limitation: new StringField({ required: false, initial: '' }),
      hasModifier: new BooleanField({ required: false, initial: false }),
      modType: new StringField({ required: false, initial: '' }),
      operator: new StringField({ required: false, initial: '' }),
      modAmount: new NumberField({ required: false, initial: 0 }),
    };
  }
}