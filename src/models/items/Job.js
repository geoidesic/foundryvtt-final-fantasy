import { FFItemDataModel } from './baseItem';

const {
  SchemaField, NumberField, StringField, BooleanField, ObjectField, ArrayField
} = foundry.data.fields;

/**
 * Data model for Job items
 * @extends {FFItemDataModel}
 */
export class JobModel extends FFItemDataModel {
  /**
   * Defines the schema for Job items
   * @returns {object} The schema definition object
   */
  static defineSchema() {
    return {
      ...super.defineSchema(),  // Merge with the base model schema
      level: new NumberField({ required: true, initial: 0 }),
      role: new StringField({ required: true, initial: '' }),
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
    }
  }
}
