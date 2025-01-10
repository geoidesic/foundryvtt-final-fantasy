import { SYSTEM_ID } from "../constants";

/**
 * Handles transferring effects to allied actors
 */
export default class TransferEffectToAllies {
  /**
   * @param {Actor} actor - The actor this effect is applied to
   */
  constructor(actor) {
    this.actor = actor;
  }

  /**
   * Delete transferred effects from allies
   * @param {object} event - The event containing effect data
   */
  async delete(event) {
    const { change, effect } = event;

    const transferredEffects = game.actors.reduce((acc, actor) => {
      return acc.concat(actor.effects.filter(e => 
        e.getFlag(SYSTEM_ID, 'origin.actor.uuid') === this.actor.uuid &&
        e.name === effect.name
      ));
    }, []);
    
    game.system.log.p("[EFFECT] Removing transferredEffects", transferredEffects);
    game.system.log.p("[EFFECT] Removing transferred effects for", effect.name);
    
    for (const transferredEffect of transferredEffects) {
      await transferredEffect.delete();
    }
  }

  /**
   * Process the transfer effect to allies
   * @param {object} event - The event containing effect data
   * @return {Promise<void>} A promise that resolves when processing is complete
   */
  async process(event) {
    game.system.log.p("[TRANSFER] Starting effect transfer process", event);
    const { change, effect } = event;
    game.system.log.p("[TRANSFER] Source actor:", this.actor.name);
    game.system.log.p("[TRANSFER] Effect:", effect);

   
    // Create the effect on each ally's actor
    for (const token of this.actor.allyTokens) {
      game.system.log.p("[TRANSFER] Processing token:", token.name);
      
      // Skip if no actor
      if (!token.actor) {
        game.system.log.p("[TRANSFER] No actor for token, skipping");
        continue;
      }


      let changes = foundry.utils.deepClone(effect.changes);
      //- remove the TransferEffectToAllies change
      changes = changes.filter(change => change.key !== 'TransferEffectToAllies');

      // Create a copy of the effect on the ally
      const effectData = {
        name: effect.name,
        label: effect.label,
        icon: effect.icon,
        changes,
        flags: foundry.utils.deepClone(effect.flags),
        origin: effect.origin,
        disabled: false
      };

      //NB: do not set duration as this will be controlled by the origin item
      effectData.flags[SYSTEM_ID].origin = {
        actor: {
          uuid: this.actor.uuid,
          name: this.actor.name,
          img: this.actor.img
        }
      }

      game.system.log.p("[TRANSFER] Created effect data:", effectData);

      // Add a flag to mark this as a transferred effect
      // effectData.flags[SYSTEM_ID].transferredFrom = this.actor.uuid;

      try {
        await token.actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
        game.system.log.p("[TRANSFER] Successfully created effect on", token.name, effectData, token.actor);
      } catch (error) {
        game.system.log.e("[TRANSFER] Error creating effect:", error);
      }
    }
  }
} 