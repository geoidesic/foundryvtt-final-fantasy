import { FFItemDataModel } from './baseItem';

const { NumberField, StringField } = foundry.data.fields;

/**
 * Data model for Equipment items
 * @extends {FFItemDataModel}
 */
export class EquipmentModel extends FFItemDataModel {
  /**
   * Defines the schema for Equipment items
   * @return {object} The schema definition object
   */
  static defineSchema() {
    return {
      ...super.defineSchema(),  // Merge with the base model schema
      quantity: new NumberField({ required: false, integer: true, min: 0, initial: 1 }),
      actionType: new StringField({ 
        required: true, 
        choices: ['primary', 'secondary'], 
        initial: 'secondary' 
      }),
    };
  }
}