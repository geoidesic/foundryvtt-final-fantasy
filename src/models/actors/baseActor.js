import { FFTypeDataModel } from '../baseModel';
const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField
} = foundry.data.fields;

export class FFActorDataModel extends FFTypeDataModel {
  static defineSchema() {
    return {
    }
  }
}