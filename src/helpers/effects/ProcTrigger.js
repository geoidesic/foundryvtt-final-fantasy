import { SYSTEM_ID } from "~/src/helpers/constants";

/**
 * Handles proc trigger effects
 */
export default class ProcTrigger {
  /**
   * @param {Actor} actor - The actor this effect is applied to
   */
  constructor(actor) {
    this.actor = actor;
  }

  /**
   * Process the proc trigger effect
   * @param {object} event - The event containing item and roll data
   * @return {Promise<void>} A promise that resolves when processing is complete
   */
  async process(event) {
    

    const { item, roll } = event;
    if (!item.system.procs?.list?.length) {
      return;
    }

    // Get d20 result - either from existing roll or make new roll
    let d20Result;
    if (item.system.hasCR && roll) {
      const d20Term = roll.terms[0];
      d20Result = d20Term.modifiers.includes('kh1') 
        ? Math.max(...d20Term.results.map(r => r.result))
        : d20Term.results[0].result;
    } else {
      const procRoll = await new Roll('1d20').evaluate();
      d20Result = procRoll.terms[0].results[0].result;
    }


    if (!item.system.procTrigger || d20Result < item.system.procTrigger) {
      return;
    }

    // Process each proc effect
    for (const procRef of item.system.procs.list) {
      
      const procItem = await fromUuid(procRef.uuid);
      if (!procItem) {
        continue;
      }

      // Find actor's version of the proc item
      const actorItem = this.actor.items.find(i => 
        i.name === procItem.name && 
        i.type === procItem.type
      );


      if (!actorItem?.hasEffects) {
        continue;
      }

      // Enable the effects
      await this.actor.enableLinkedEffects(actorItem);

      // Send a chat message for the proc trigger
      await ChatMessage.create({
        user: game.user.id,
        speaker: game.settings.get(SYSTEM_ID, 'chatMessageSenderIsActorOwner') ? ChatMessage.getSpeaker({ actor: this.actor }) : null,
        flags: {
          [SYSTEM_ID]: {
            data: {
              chatTemplate: 'RollChat',
              actor: {
                _id: this.actor._id,
                name: this.actor.name,
                img: this.actor.img
              },
              item: {
                _id: actorItem._id,
                uuid: actorItem.uuid,
                name: actorItem.name,
                img: actorItem.img,
                type: actorItem.type,
                system: actorItem.system
              }
            }
          }
        }
      });
    }
  }
}