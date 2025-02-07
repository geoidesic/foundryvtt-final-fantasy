const {
  StringField, ArrayField, BooleanField
} = foundry.data.fields;

/**
 * Model for Active Effects in the system
 * @extends {foundry.abstract.TypeDataModel}
 */
export default class FFEffectModel extends foundry.abstract.TypeDataModel {
  /**
   * Defines the schema for Active Effect data
   * @return {object} The schema definition object
   */
  static defineSchema() {
    return {
      tags: new ArrayField(
        new StringField({ required: false, initial: '' })
      )
    }
  }
}