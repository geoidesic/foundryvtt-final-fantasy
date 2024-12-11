import { FFTypeDataModel } from '~/src/models/baseModel';
const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField
} = foundry.data.fields;

export class FFActorDataModel extends FFTypeDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      inventoryLocked: new BooleanField({ initial: false }),
      description: new HTMLField(),
      DOT: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    }
  }
}