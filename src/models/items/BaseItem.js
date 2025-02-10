import { FFTypeDataModel } from "~/src/models/BaseModel";

const { HTMLField, BooleanField, StringField, NumberField } = foundry.data.fields;

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
      hasDuration: new BooleanField({ required: false, initial: false }),
      durationUnits: new StringField({ required: false, initial: "phase" }),
      durationType: new StringField({ required: false, initial: "turns" }),
      durationQualifier: new StringField({ required: false, initial: "" }),
      durationAmount: new NumberField({ required: false, initial: 0, integer: true, min: 0 }),
    };
  }
}
