import { FFItemDataModel } from './baseItem';

const {
    HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField
} = foundry.data.fields;

export class EquipmentModel extends FFItemDataModel {
    static defineSchema() {
        return {
            quantity: new NumberField({ required: false, integer: true, min: 0, initial: 1 }),
        }
    }
    static migrateData(source) {
        const quantity = source.system.quantity;
        if (!quantity) {
          quantity = 1;
        }
        return super.migrateData(source);
      }
}