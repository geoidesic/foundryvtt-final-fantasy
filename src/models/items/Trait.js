import { FFItemDataModel } from './baseItem';


const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField
} = foundry.data.fields;

export class TraitModel extends FFItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),  // Merge with the base model schema
      
    };
  }
}