import { FFActorDataModel } from './baseActor';

const {
  StringField
} = foundry.data.fields;

/**
 * Data model for NPC actors
 * @extends {FFActorDataModel}
 */
export class NPCModel extends FFActorDataModel {
  /**
   * Defines the schema for NPC data
   * @return {object} The schema definition object
   */
  static defineSchema() {
    return {
      ...super.defineSchema(),
      size: new StringField({ initial: "" }),
    }
  }
}

