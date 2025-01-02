import { activeEffectModes, ACTIVE_EFFECT_MODES } from "~/src/helpers/constants";

export default class PrimaryBaseDamageBuff {

  constructor(actor) {
    this.actor = actor;
  }

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