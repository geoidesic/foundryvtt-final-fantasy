import { FFItemDataModel } from './baseItem';

const {
  SchemaField, NumberField, StringField, BooleanField, ArrayField
} = foundry.data.fields;

/**
 * Data model for Trait items
 * @extends {FFItemDataModel}
 */
export class TraitModel extends FFItemDataModel {
  /**
   * Defines the schema for Trait items
   * @returns {object} The schema definition object
   */
  static defineSchema() {
    return {
      ...super.defineSchema(),  // Merge with the base model schema
      type: new StringField({ required: false, initial: '' }),
      hasLimitation: new BooleanField({ required: false, initial: false }),
      limitation: new NumberField({ required: false, initial: 0, integer: true, min: 0, max: 3 }),
      limitationUnits: new StringField({ required: false, initial: "phase" }),
      uses: new NumberField({ required: false, initial: 0, integer: true, min: 0 }),
      hasModifier: new BooleanField({ required: false, initial: false }),
      modType: new StringField({ required: false, initial: '' }),
      operator: new StringField({ required: false, initial: '+' }),
      modAmount: new NumberField({ required: false, initial: 0 }),
      hasDamageDiceReroll: new BooleanField({ required: false, initial: false }),
      damageDiceReroll: new NumberField({ required: false, initial: 0, integer: true, min: 0, max: 3 }),
      hasTags: new BooleanField({ required: false, initial: false }),
      tags: new ArrayField(
        new StringField({ required: false, initial: '' })
      ),
      hasDuration: new BooleanField({ required: false, initial: false }),
      duration: new SchemaField({
        turns: new NumberField({ required: false, initial: 0, integer: true, min: 0, max: 3 }),
        rounds: new NumberField({ required: false, initial: 0, integer: true, min: 0, max: 3 }),
      }),
    };
  }

}