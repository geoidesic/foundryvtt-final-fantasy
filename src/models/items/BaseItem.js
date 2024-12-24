import { FFTypeDataModel } from "~/src/models/BaseModel";
const { HTMLField, BooleanField } = foundry.data.fields;

export class FFItemDataModel extends FFTypeDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),  // Include the schema from the base class
      description: new HTMLField(),
      favourite: new BooleanField({ initial: false }),
      effectActionsLocked: new BooleanField({ initial: false }),
    };
  }
}
