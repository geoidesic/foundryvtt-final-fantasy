import { activeEffectModes, ACTIVE_EFFECT_MODES } from "~/src/helpers/constants";

export default class TransferEffectToAllies {
  constructor(actor) {
    this.actor = actor;
  }

  async process(event) {
    game.system.log.p("[TRANSFER] Starting effect transfer process", event);
    const { change, effect } = event;
    game.system.log.p("[TRANSFER] Source actor:", this.actor.name);
    game.system.log.p("[TRANSFER] Effect:", effect);

    // Get all friendly tokens except those belonging to the source actor
    const allyTokens = canvas.tokens.placeables.filter(token => 
      token.document.disposition === 1 && // Friendly disposition
      token.actor?.id !== this.actor.id // Not the source actor
    );
    game.system.log.p("[TRANSFER] Found ally tokens:", allyTokens.map(t => t.name));

    // Create the effect on each ally's actor
    for (const token of allyTokens) {
      game.system.log.p("[TRANSFER] Processing token:", token.name);
      
      // Skip if no actor
      if (!token.actor) {
        game.system.log.p("[TRANSFER] No actor for token, skipping");
        continue;
      }

      // Check if ally already has this effect (enabled or disabled)
      const existingEffect = token.actor.effects.find(e => e.name === effect.name);
      if (existingEffect) {
        game.system.log.p("[TRANSFER] Found existing effect, enabling it");
        await existingEffect.update({ disabled: false });
        continue;
      }

      // Create a copy of the effect on the ally
      const effectData = {
        name: effect.name,
        label: effect.label,
        icon: effect.icon,
        changes: foundry.utils.deepClone(effect.changes),
        duration: effect.duration,
        flags: foundry.utils.deepClone(effect.flags),
        origin: effect.origin,
        disabled: false
      };
      game.system.log.p("[TRANSFER] Created effect data:", effectData);

      // Add a flag to mark this as a transferred effect
      effectData.flags.transferredFrom = this.actor.uuid;

      try {
        await token.actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
        game.system.log.p("[TRANSFER] Successfully created effect on", token.name, effectData, token.actor);
      } catch (error) {
        game.system.log.e("[TRANSFER] Error creating effect:", error);
      }
    }
  }
} 