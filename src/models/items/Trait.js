import { FFItemDataModel } from './baseItem';


const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField
} = foundry.data.fields;

export class TraitModel extends FFItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),  // Merge with the base model schema
      ranged: new BooleanField({ required: false, initial: false }),
      rangeType: new StringField({ required: false, initial: '' }),
      rangeValue: new NumberField({ required: false, initial: 0 }),
      trigger: new StringField({ required: false, initial: '' }),
      target: new StringField({ required: false, initial: '' }),
      baseEffect: new StringField({ required: false, initial: '' }),
      checkAttribute: new StringField({ required: false, initial: '' }),
      checkBonus: new NumberField({ required: false, initial: 0 }),
      CR: new NumberField({ required: false, initial: 0 }),
      directHit: new StringField({ required: false, initial: '' }),
      heavierShot: new StringField({ required: false, initial: '' }),
      limitation: new NumberField({ required: false, initial: 0 }),
    };
  }
}