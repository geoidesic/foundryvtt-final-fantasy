import { FFItemDataModel } from './baseItem';

const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField, ObjectField
} = foundry.data.fields;

export class JobModel extends FFItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),  // Merge with the base model schema
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
