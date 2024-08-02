import { FFTypeDataModel } from '../baseModel';
const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField
} = foundry.data.fields;

export class FFItemDataModel extends FFTypeDataModel {
  static defineSchema() {
    return {
        description: new HTMLField(),
    }
  }
}