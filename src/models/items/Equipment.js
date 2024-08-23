import { FFItemDataModel } from './baseItem';
const { NumberField } = foundry.data.fields;

export class EquipmentModel extends FFItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),  // Merge with the base model schema
      quantity: new NumberField({ required: false, integer: true, min: 0, initial: 1 }),
    };
  }

  static migrateData(source) {
    // Migrate data from the base class first
    source = super.migrateData(source);
    
    // Custom migration logic for this model
    if (source.quantity === undefined) {
      source.quantity = 1;
    }

    return source;
  }
}
