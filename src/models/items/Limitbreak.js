import { FFItemDataModel } from './baseItem';

const {
  StringField, BooleanField
} = foundry.data.fields;

/**
 * Data model for Limitbreak items
 * @extends {FFItemDataModel}
 */
export class EffectModel extends FFItemDataModel {
  /**
   * Defines the schema for Limitbreak items
   * @returns {object} The schema definition object
   */
  static defineSchema() {
    return {
      ...super.defineSchema(),  // Merge with the base model schema
      hasRanged: new BooleanField({ required: false, initial: false }),
      rangeType: new StringField({ required: false, initial: '' }),
      hasTrigger: new BooleanField({ required: false, initial: false }),
      trigger: new StringField({ required: false, initial: '' }),
      hasTarget: new BooleanField({ required: false, initial: false }),
      target: new StringField({ required: false, initial: '' }),
      baseEffect: new StringField({ required: false, initial: '' }),
    };
  }
}