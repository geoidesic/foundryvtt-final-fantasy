import { FFTypeDataModel } from "~/src/models/BaseModel";
const { HTMLField, BooleanField } = foundry.data.fields;

export class FFItemDataModel extends FFTypeDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),  // Include the schema from the base class
      description: new HTMLField(),
      favourite: new BooleanField({ initial: false }),
    };
  }

  static migrateData(source) {
    // Migrate base model fields
    source = super.migrateData(source);
    
    // Custom migration logic for this model
    if (source.favourite === undefined) {
      source.favourite = false;
    }
    
    return source;
  }
}
