const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField, ObjectField
} = foundry.data.fields;


export default class FFEffectModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      tags: new ArrayField(
        new StringField({ required: false, initial: '' })
      ),
    }
  }
}