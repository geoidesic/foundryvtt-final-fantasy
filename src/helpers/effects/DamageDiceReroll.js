import { activeEffectModes, ACTIVE_EFFECT_MODES } from "~/src/helpers/constants";

export default class DamageDiceReroll {

  constructor(actor) {
    this.actor = actor;
  }
  async process(event) {
    const { DamageResults } = event;
    if(!DamageResults || !DamageResults.size) return;

    for (const effect of this.actor.effects) {
      if (effect.disabled || effect.isSuppressed) continue;
      
      const origin = fromUuidSync(effect.origin);
      for (const change of effect.changes) {
        if (change.key === 'DamageDiceReroll' && change.mode === ACTIVE_EFFECT_MODES.CUSTOM) {
          for (const [targetId, targetData] of DamageResults) {
            const [numDice, dieType] = targetData.directHit.split('d').map(Number);
            if (!numDice || !dieType) continue;

            const additionalDice = Number(change.value) || 1;
            const newNumDice = numDice + additionalDice;
            const kh = numDice;
            targetData.directHit = `${newNumDice}d${dieType}kh${kh}`;
            targetData.baseDamageFormula += ` + ${origin.name}`;
            targetData.directHitDisplayFormula += ` + ${effect.name}`;
          }
        }
      }
    }
  }
}