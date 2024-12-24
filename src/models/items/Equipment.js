import { FFItemDataModel } from './baseItem';
import { localize } from "~/src/helpers/util";
const { NumberField, StringField } = foundry.data.fields;

export class EquipmentModel extends FFItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),  // Merge with the base model schema
      quantity: new NumberField({ required: false, integer: true, min: 0, initial: 1 }),
      actionType: new StringField({ required: true, choices: [{ value: 'primary', label: localize('Primary') }, { value: 'secondary', label: localize('Secondary') }], initial: 'secondary' }),
    };
  }
}