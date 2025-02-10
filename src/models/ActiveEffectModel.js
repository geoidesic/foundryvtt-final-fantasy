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
      ),
      duration: new foundry.data.fields.SchemaField({
        type: new StringField({
          required: true,
          initial: "none",
          choices: [
            "none",
            "rounds",
            "turns",
            "endOfThis",
            "endOfNext", 
            "startOfNext",
            "untilDamage",
            "nextAbility"
          ]
        })
      })
    }
  }

  /** @override */
  prepareBaseData() {
    super.prepareBaseData();
    
    // Ensure flags exist
    if (!this.parent.flags['foundryvtt-final-fantasy']) {
      this.parent.flags['foundryvtt-final-fantasy'] = {};
    }
    
    // Set default stackable behavior if not already set
    if (!this.parent.flags['foundryvtt-final-fantasy'].stackable) {
      this.parent.flags['foundryvtt-final-fantasy'].stackable = 'differentSource';
    }
  }
}