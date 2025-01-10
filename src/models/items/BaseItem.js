import { FFTypeDataModel } from "~/src/models/BaseModel";

const { HTMLField, BooleanField } = foundry.data.fields;

/**
 * Base data model for all item types
 * @extends {FFTypeDataModel}
 */
export class FFItemDataModel extends FFTypeDataModel {
  /**
   * Defines the base schema for item data models
   * @return {object} The schema definition object
   */
  static defineSchema() {
    return {
      ...super.defineSchema(),  // Include the schema from the base class
      description: new HTMLField(),
      favourite: new BooleanField({ initial: false }),
      effectActionsLocked: new BooleanField({ initial: false }),
    };
  }
}
