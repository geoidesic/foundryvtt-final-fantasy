import { FFItemDataModel } from './baseItem';

const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField
} = foundry.data.fields;

export class JobModel extends FFItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),  // Merge with the base model schema
      grants: new SchemaField({
        list: new ArrayField(
          new StringField({ required: true, initial: '' })
        ),
        value: new BooleanField({ required: true, initial: false })
      }),
    }
  }
}