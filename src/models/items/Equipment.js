import { FFItemDataModel } from './baseItem';
const { NumberField } = foundry.data.fields;

export class EquipmentModel extends FFItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),  // Merge with the base model schema
      quantity: new NumberField({ required: false, integer: true, min: 0, initial: 1 }),
    };
  }


}
