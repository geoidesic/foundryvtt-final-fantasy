import { FFItemDataModel } from './baseItem';

const {
  SchemaField, NumberField, StringField, BooleanField, ObjectField, ArrayField
} = foundry.data.fields;

/**
 * Data model for Action items
 * @extends {FFItemDataModel}
 */
export class ActionModel extends FFItemDataModel {

  /**
   * Defines the schema for Action items
   * @return {object} The schema definition object
   */
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
      baseEffectHealing: new StringField({ required: false, initial: '' }),
      baseEffectHealingType: new StringField({ required: false, initial: '' }),
      baseEffectDamage: new StringField({ required: false, initial: '' }),
      hasBaseEffect: new BooleanField({ required: false, initial: false }),
      hasBaseEffectHealing: new BooleanField({ required: false, initial: false }),
      hasBaseEffectDamage: new BooleanField({ required: false, initial: false }),
      hasBaseEffectRestoreMP: new BooleanField({ required: false, initial: false }),
      baseEffectRestoreMP: new NumberField({ required: false, initial: 0 }),
      hasBaseEffectBarrier: new BooleanField({ required: false, initial: false }),
      baseEffectBP: new NumberField({ required: false, initial: 0 }),
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
      uses: new NumberField({ required: false, initial: 0, integer: true, min: 0 }),
      type: new StringField({ 
        required: false, 
        choices: ['primary', 'secondary', 'reaction', 'limit', 'combo']
      }),
      hasSplitDamage: new BooleanField({ required: false, initial: false }),
      hasCostMP: new BooleanField({ required: false, initial: false }),
      costMP: new NumberField({ required: false, initial: 0 }),
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
      sourceGrants: new SchemaField({
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
      removes: new SchemaField({
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
      hasTags: new BooleanField({ required: false, initial: false }),
      tags: new ArrayField(
        new StringField({ required: false, initial: '' })
      ),
      isMagic: new BooleanField({ required: false, initial: false }),
    };
  }
}