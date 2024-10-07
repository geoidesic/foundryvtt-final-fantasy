import { FFItemDataModel } from './baseItem';

const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField
} = foundry.data.fields;

export class ActionModel extends FFItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),  // Merge with the base model schema
      ranged: new BooleanField({ required: false, initial: false }),
      rangeType: new StringField({ required: false, initial: '' }),
      rangeValue: new NumberField({ required: false, initial: 0 }),
      trigger: new StringField({ required: false, initial: '' }),
      hasTarget: new BooleanField({ required: false, initial: false }),
      target: new StringField({ required: false, initial: '' }),
      baseEffect: new StringField({ required: false, initial: '' }),
      hasCheck: new BooleanField({ required: false, initial: false }),
      checkAttribute: new StringField({ required: false, initial: '' }),
      checkBonus: new NumberField({ required: false, initial: 0 }),
      hasCR: new BooleanField({ required: false, initial: false }),
      CR: new StringField({ required: false, initial: '' }),
      hasDirectHit: new BooleanField({ required: false, initial: false }),
      directHitType: new StringField({ required: false, initial: '' }),
      directHitDamage: new StringField({ required: false, initial: '' }),
      hasHeavierShot: new BooleanField({ required: false, initial: false }),
      heavierShot: new StringField({ required: false, initial: '' }),
      hasLimitation: new BooleanField({ required: false, initial: false }),
      limitation: new StringField({ required: false, initial: '' }),
    };
  }
}