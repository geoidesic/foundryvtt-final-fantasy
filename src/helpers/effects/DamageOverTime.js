import { SYSTEM_ID } from "~/src/helpers/constants";
import { ACTIVE_EFFECT_MODES } from "~/src/helpers/constants";

/**
 * Handles damage over time effects
 */
export default class DamageOverTime {
  /**
   * @param {Actor} actor - The actor this effect is applied to
   */
  constructor(actor) {
    this.actor = actor;
  }

  /**
   * Process the damage over time effect
   * @param {object} event - The event containing damage results
   * @return {Promise<void>} A promise that resolves when processing is complete
   */
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

    // Check if actor should be KO'd
    if (this.actor.system.points.HP.val === 0 && !this.actor.statuses.has('ko')) {
      game.system.log.o("[DOT] Actor at 0 HP and not KO'd, applying KO status");
      await this.actor.toggleStatusEffect("ko");
      game.system.log.o("[DOT] KO status applied");
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

  /**
   * Handle DOT effects during combat updates
   * @param {Combat} combat - The combat being updated
   * @param {object} changed - The changes made to the combat
   * @param {object} options - Update options
   */
  async updateCombat(combat, changed, options) {
    game.system.log.o("[DOT updateCombat] Starting method for actor:", {
      name: this.actor.name,
      type: this.actor.type,
      id: this.actor.id
    });

    // Get the previous turn's state
    const previousCombatant = combat.turns[combat.previous?.turn];
    const nextCombatant = combat.turns[combat.previous?.turn + 1];
    const wasAdventurerStepEnd = previousCombatant?.actor?.type === "PC" && nextCombatant?.actor?.type === "NPC";
    const wasEnemyStepEnd = previousCombatant?.actor?.type === "NPC" && (!nextCombatant || nextCombatant?.actor?.type === "PC");

    game.system.log.o("[DOT updateCombat] Combat state:", {
      wasAdventurerStepEnd,
      wasEnemyStepEnd,
      previousCombatant: previousCombatant?.actor?.name,
      nextCombatant: nextCombatant?.actor?.name
    });

    // Process DOT effects at the end of each step
    const effects = this.actor.effects;
    game.system.log.o("[DOT updateCombat] Found effects:", effects.size);

    for (const effect of effects) {
      game.system.log.o("[DOT updateCombat] Processing effect:", {
        name: effect.name,
        disabled: effect.disabled,
        changes: effect.changes
      });

      if (!effect.disabled) {
        // At adventurer step end, process DOTs on PCs
        if (wasAdventurerStepEnd && this.actor.type === "PC") {
          game.system.log.o("[DOT updateCombat] Processing PC DOT at adventurer step end");
          for (const change of effect.changes) {
            game.system.log.o("[DOT updateCombat] Checking change:", {
              key: change.key,
              mode: change.mode,
              value: change.value
            });

            if (change.key === "DamageOverTime" && change.mode === ACTIVE_EFFECT_MODES.CUSTOM) {
              game.system.log.o("[DOT updateCombat] Calling DOT hook");
              await Hooks.callAll('FF15.DamageOverTime', { actor: this.actor, change, effect });
            }
          }
        }
        // At enemy step end, process DOTs on NPCs
        else if (wasEnemyStepEnd && this.actor.type === "NPC") {
          game.system.log.o("[DOT updateCombat] Processing NPC DOT at enemy step end");
          for (const change of effect.changes) {
            game.system.log.o("[DOT updateCombat] Checking change:", {
              key: change.key,
              mode: change.mode,
              value: change.value
            });

            if (change.key === "DamageOverTime" && change.mode === ACTIVE_EFFECT_MODES.CUSTOM) {
              game.system.log.o("[DOT updateCombat] Calling DOT hook");
              await Hooks.callAll('FF15.DamageOverTime', { actor: this.actor, change, effect });
            }
          }
        }
      }
    }
  }
} 