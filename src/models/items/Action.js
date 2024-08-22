import { FFItemDataModel } from './baseItem';

const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField
} = foundry.data.fields;

export class ActionDataModel extends FFItemDataModel {
  static defineSchema() {
    return {

    }
  }
}