import { FFItemDataModel } from './baseItem';

/**
 * Data model for Effect items
 * @extends {FFItemDataModel}
 */
export class EffectModel extends FFItemDataModel {
  /**
   * Defines the schema for Effect items
   * @return {object} The schema definition object
   */
  static defineSchema() {
    return {
      ...super.defineSchema(),  // Merge with the base model schema
      
    };
  }
}