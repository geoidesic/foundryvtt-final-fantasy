import { ACTIVE_EFFECT_MODES } from "~/src/helpers/constants";

/**
 * Handles primary base damage buff effects
 */
export default class PrimaryBaseDamageBuff {
  /**
   * @param {Actor} actor - The actor this effect is applied to
   */
  constructor(actor) {
    this.actor = actor;
  }

  /**
   * Process the primary base damage buff effect
   * @param {object} event - The event containing damage results
   * @return {Promise<void>} A promise that resolves when processing is complete
   */
  async process(event) {
    const { DamageResults } = event;
    
    for (const effect of this.actor.effects) {
      const origin = fromUuidSync(effect.origin);
      for (const change of effect.changes) {
        
        if(change.key === '@PrimaryBaseDamageBuff' && change.mode === ACTIVE_EFFECT_MODES.ADD) {
          for (const [targetData] of DamageResults) {
            targetData.damage = parseInt(targetData.damage) + parseInt(change.value);
            targetData.baseDamageFormula += ` + ${origin.name} (${change.value})`;
          }
        }
      }
    }
  }
  
}