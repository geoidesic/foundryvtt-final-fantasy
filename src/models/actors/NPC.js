import { FFActorDataModel } from './baseActor';

const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField
} = foundry.data.fields;

export class NPCDataModel extends FFActorDataModel {
  static defineSchema() {
    return {
      description: new HTMLField(),
    }
  }
}

