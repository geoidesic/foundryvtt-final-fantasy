import { activeEffectModes, ACTIVE_EFFECT_MODES } from "~/src/helpers/constants";

export default class PrimaryBaseDamageBuff {

  constructor(actor) {
    this.actor = actor;
  }

  async process(event) {
    const { DamageResults } = event;
    game.system.log.o('[PrimaryBaseDamageBuff] processing event:', event);
    game.system.log.o('[PrimaryBaseDamageBuff] initial DamageResults:', DamageResults);
    
    for (const effect of this.actor.effects) {
      game.system.log.o('[PrimaryBaseDamageBuff] checking effect:', effect);
      const origin = fromUuidSync(effect.origin);
      for (const change of effect.changes) {
        game.system.log.o('[PrimaryBaseDamageBuff] checking change:', {
          key: change.key,
          mode: change.mode,
          value: change.value
        });
        
        if(change.key === '@PrimaryBaseDamageBuff' && change.mode === ACTIVE_EFFECT_MODES.ADD) {
          for (const [targetId, targetData] of DamageResults) {
            const oldDamage = targetData.damage;
            targetData.damage = parseInt(targetData.damage) + parseInt(change.value);
            targetData.baseDamageFormula += ` + ${origin.name}`;
            game.system.log.o('[PrimaryBaseDamageBuff] modified damage for target:', {
              targetId,
              added: change.value,
              new: targetData.damage,
              old: oldDamage
            });
          }
        }
      }
    }
  }
  
}