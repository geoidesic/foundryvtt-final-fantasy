import { FFItemDataModel } from './baseItem';

const {
    HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField
} = foundry.data.fields;

export class JobModel extends FFItemDataModel {
    static defineSchema() {
        return {

        }
    }
}