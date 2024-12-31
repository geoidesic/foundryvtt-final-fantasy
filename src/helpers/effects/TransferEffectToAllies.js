import { activeEffectModes, ACTIVE_EFFECT_MODES } from "~/src/helpers/constants";

export default class TransferEffectToAllies {
  constructor(actor) {
    this.actor = actor;
  }

  async process(event) {
    const { item } = event;
    
    // Get all ally tokens that are combatants
    const allyTokens = this.actor.allyTokens;
    if (!allyTokens?.length) return;

    for (const effect of this.actor.effects) {
      if (effect.disabled || effect.isSuppressed) continue;
      
      for (const change of effect.changes) {
        if (change.key === '@TransferEffectToAllies' && change.mode === ACTIVE_EFFECT_MODES.CUSTOM) {
          // Get the origin item of this effect
          const originItem = fromUuidSync(effect.origin);
          if (!originItem) continue;

          // Clone all changes from the parent effect except @TransferEffectToAllies
          const clonedChanges = effect.changes
            .filter(c => c.key !== '@TransferEffectToAllies')
            .map(c => foundry.utils.deepClone(c));

          // Create the new effect data with the cloned changes
          const newEffectData = {
            name: `${originItem.name} (Transferred)`,
            icon: effect.icon,
            changes: clonedChanges,
            disabled: false,
            duration: {
              rounds: originItem.system.durationUnits === 'round' ? originItem.system.duration : undefined,
              turns: originItem.system.durationUnits === 'turn' ? originItem.system.duration : undefined,
              startTime: game.time.worldTime,
              combat: game.combat?.id
            },
            flags: foundry.utils.deepClone(effect.flags),
            origin: effect.origin,
            statuses: new Set(effect.statuses)
          };

          // Create the effect on each ally
          for (const token of allyTokens) {
            // Skip if the effect already exists
            const existingEffect = token.actor.effects.find(e => 
              e.origin === effect.origin && 
              e.changes.some(c => c.key === clonedChanges[0]?.key)
            );
            
            if (!existingEffect) {
              await token.actor.createEmbeddedDocuments('ActiveEffect', [newEffectData]);
            }
          }
        }
      }
    }
  }
} 