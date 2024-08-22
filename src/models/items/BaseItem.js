import { FFDataModel } from '../baseModel';
const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField
} = foundry.data.fields;

export class FFItemDataModel extends FFDataModel {
  static defineSchema() {
    return {
        description: new HTMLField(),
    }
  }
}