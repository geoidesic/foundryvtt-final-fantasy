import { FFItemDataModel } from './baseItem';

const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField, ObjectField
} = foundry.data.fields;

export class ActionModel extends FFItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),  // Merge with the base model schema
      hasRanged: new BooleanField({ required: false, initial: false }),
      rangeType: new StringField({ required: false, initial: '' }),
      // rangeValue: new NumberField({ required: false, initial: 0 }),
      hasTrigger: new BooleanField({ required: false, initial: false }),
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
      type: new StringField({ required: false, initial: '' }),
      formula: new StringField({ required: false, initial: '' }),
      hasCost: new BooleanField({ required: false, initial: false }),
      cost: new NumberField({ required: false, initial: 0 }),
      directHitText: new StringField({ required: false, initial: '' }),
      grants: new SchemaField({
        list: new ArrayField(
          new ObjectField({ // Use ObjectField to allow storing objects
            fields: {
              uuid: new StringField({ required: true, initial: '' })
            }
          })
        ),
        value: new BooleanField({ required: true, initial: false })
      }),
    };
  }
}