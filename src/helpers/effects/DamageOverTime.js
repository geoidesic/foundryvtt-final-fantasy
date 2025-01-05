import { SYSTEM_ID } from "~/src/helpers/constants";

export default class DamageOverTime {
  constructor(actor) {
    this.actor = actor;
  }

  async process(event) {
    game.system.log.o("[DOT] Processing event:", event);
    const { change, effect } = event;
    const currentHP = this.actor.system.points.HP.val;
    const dotDamage = parseInt(change.value) || 0;
    
    game.system.log.o("[DOT] Current state:", {
      actorName: this.actor.name,
      currentHP,
      dotDamage,
      change
    });
    
    if (dotDamage <= 0) {
      game.system.log.o("[DOT] No damage to apply");
      return;
    }

    const newHP = Math.max(0, currentHP - dotDamage);
    game.system.log.o("[DOT] Applying damage:", {
      actorName: this.actor.name,
      currentHP,
      newHP,
      damage: dotDamage
    });

    await this.actor.update({ "system.points.HP.val": newHP });

    // If the actor was KO'd by the DOT, apply the KO status
    if (currentHP > 0 && newHP <= 0) {
      game.system.log.o("[DOT] Actor KO'd by DOT");
      await this.actor.toggleStatusEffect("ko");
    }

    // Create a chat message using RollChat template
    await ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flags: {
        [SYSTEM_ID]: {
          data: {
            chatTemplate: "RollChat",
            actor: {
              _id: this.actor.id,
              name: this.actor.name,
              img: this.actor.img
            },
            item: {
              name: effect.name,
              img: effect.icon,
              type: "effect",
              system: {
                description: `${this.actor.name} takes ${dotDamage} damage from ${effect.name}`,
                formula: dotDamage.toString()
              }
            }
          }
        }
      }
    });
  }
} 