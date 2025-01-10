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
   */
  async process(event) {
    const { DamageResults } = event;
    
    for (const effect of this.actor.effects) {
      const origin = fromUuidSync(effect.origin);
      for (const change of effect.changes) {
        
        if(change.key === '@PrimaryBaseDamageBuff' && change.mode === ACTIVE_EFFECT_MODES.ADD) {
          for (const [targetId, targetData] of DamageResults) {
            const oldDamage = targetData.damage;
            targetData.damage = parseInt(targetData.damage) + parseInt(change.value);
            targetData.baseDamageFormula += ` + ${origin.name} (${change.value})`;
           
          }
        }
      }
    }
  }
  
}