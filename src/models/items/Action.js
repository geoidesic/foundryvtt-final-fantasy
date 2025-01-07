import { FFItemDataModel } from './baseItem';

const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField, ObjectField
} = foundry.data.fields;

export class ActionModel extends FFItemDataModel {

  static defineSchema() {
    return {
      ...super.defineSchema(),  // Merge with the base model schema
      hasAspected: new BooleanField({ required: false, initial: false }),
      aspected: new StringField({ required: false, initial: '' }),
      hasRanged: new BooleanField({ required: false, initial: false }),
      rangeType: new StringField({ required: false, initial: '' }),
      hasTrigger: new BooleanField({ required: false, initial: false }),
      trigger: new StringField({ required: false, initial: '' }),
      hasTarget: new BooleanField({ required: false, initial: false }),
      target: new StringField({ required: false, initial: '' }),
      baseEffectType: new StringField({ required: false, initial: '' }),
      baseEffect: new StringField({ required: false, initial: '' }),
      hasBaseEffect: new BooleanField({ required: false, initial: false }),
      hasCheck: new BooleanField({ required: false, initial: false }),
      checkAttribute: new StringField({ required: false, initial: '' }),
      checkBonus: new NumberField({ required: false, initial: 0 }),
      hasCR: new BooleanField({ required: false, initial: false }),
      CR: new StringField({ required: false, initial: '' }),
      hasDirectHit: new BooleanField({ required: false, initial: false }),
      directHitType: new StringField({ required: false, initial: '' }),
      directHitDamage: new StringField({ required: false, initial: '' }),
      directHitText: new StringField({ required: false, initial: '' }),
      directHitCondition: new StringField({ required: false, initial: '' }),
      hasHeavierShot: new BooleanField({ required: false, initial: false }),
      heavierShot: new StringField({ required: false, initial: '' }),
      hasLimitation: new BooleanField({ required: false, initial: false }),
      limitation: new NumberField({  required: false, initial: 0, integer: true, min: 0, max: 3 }),
      limitationUnits: new StringField({ required: false, initial: "phase" }),
      hasDuration: new BooleanField({ required: false, initial: false }),
      duration: new NumberField({  required: false, initial: 0, integer: true, min: 0, max: 3 }),
      durationUnits: new StringField({ required: false, initial: "phase" }),
      uses: new NumberField({ required: false, initial: 0, integer: true, min: 0 }),
      type: new StringField({ 
        required: false, 
        choices: ['primary', 'secondary', 'reaction', 'limit', 'combo']
      }),
      formula: new StringField({ required: false, initial: '' }),
      hasCost: new BooleanField({ required: false, initial: false }),
      cost: new NumberField({ required: false, initial: 0 }),
      procTrigger: new NumberField({ required: false, initial: null }),
      procs: new SchemaField({
        list: new ArrayField(
          new ObjectField({
            fields: {
              uuid: new StringField({ required: true, initial: '' })
            }
          })
        ),
        value: new BooleanField({ required: true, initial: false })
      }),
      grants: new SchemaField({
        list: new ArrayField(
          new ObjectField({
            fields: {
              uuid: new StringField({ required: true, initial: '' })
            }
          })
        ),
        value: new BooleanField({ required: true, initial: false })
      }),
      requires: new SchemaField({
        list: new ArrayField(
          new ObjectField({
            fields: {
              uuid: new StringField({ required: true, initial: '' })
            }
          })
        ),
        value: new BooleanField({ required: true, initial: false })
      }),
      enables: new SchemaField({
        list: new ArrayField(
          new ObjectField({
            fields: {
              uuid: new StringField({ required: true, initial: '' })
            }
          })
        ),
        value: new BooleanField({ required: true, initial: false })
      }),
      combos: new SchemaField({
        list: new ArrayField(
          new ObjectField({
            fields: {
              uuid: new StringField({ required: true, initial: '' })
            }
          })
        ),
        value: new BooleanField({ required: true, initial: false })
      }),
      hasTags: new BooleanField({ required: false, initial: false }),
      tags: new ArrayField(
        new StringField({ required: false, initial: '' })
      ),
      isMagic: new BooleanField({ required: false, initial: false }),
    };
  }

}