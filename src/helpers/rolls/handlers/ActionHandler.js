import { SYSTEM_ID } from "~/src/helpers/constants";
import { generateRandomElementId } from "~/src/helpers/util";

/**
 * Handles all action-related operations
 */
export default class ActionHandler {
  /**
   * @param {Actor} actor - The actor this handler is for
   */
  constructor(actor) {
    this.actor = actor;
  }

  /**
   * Handle an action ability
   * @param {Item} item - The action item
   * @param {Object} [options={}] - Additional options
   * @return {Promise<{success: boolean, message: ChatMessage|null}>} Returns result of action handling
   */
  async handle(item, options = {}) {
    try {
      const targets = game.user.targets;
      const hasTargets = targets.size > 0;
      const targetIds = Array.from(targets).map(target => target.id);

      let message;
      let roll;
      let isCritical = false;
      let d20Result = null;

      if (item.system.hasCR) {
        // Handle roll with modifiers
        const rollResult = await this._handleRollWithModifiers(item);
        roll = rollResult.roll;
        isCritical = rollResult.isCritical;
        d20Result = rollResult.d20Result;

        // Create message data with roll results
        const messageData = this._createActionMessageData(item, hasTargets, targetIds, roll, isCritical);
        messageData.flags[SYSTEM_ID].data.isCritical = isCritical;
        messageData.flags[SYSTEM_ID].data.d20Result = d20Result;

        // Get target's defense value based on CR type
        if (hasTargets) {
          const target = targets.values().next().value;
          const targetActor = target.actor;
          
          let crValue = 0;
          if (targetActor) {
            if (targetActor.type === "npc") {
              crValue = targetActor.system.attributes[item.system.CR]?.val || 0;
            } else {
              crValue = targetActor.system.attributes.secondary[item.system.CR]?.val || 0;
            }
          }

          const isSuccess = isCritical || roll.total >= crValue;
          messageData.flags[SYSTEM_ID].data.isSuccess = isSuccess;

          game.system.log.o('[ABILITY:ROLL] CR check:', {
            itemName: item.name,
            rollTotal: roll.total,
            CR: item.system.CR,
            crValue,
            isSuccess,
            isCritical,
            d20Result
          });

          // Check for proc trigger after confirming hit
          if (item.system.procTrigger && isSuccess) {
            game.system.log.o('[PROC] Triggering proc for:', {
              itemName: item.name,
              roll: roll.total,
              isSuccess,
              isCritical
            });
            
            Hooks.callAll('FF15.ProcTrigger', { 
              actor: this.actor, 
              item,
              roll,
              targets
            });
          }
        }

        message = await roll.toMessage(messageData);
      } else {
        message = item.system.hasBaseEffect && Boolean(item.system.baseEffectDamage)
          ? await ChatMessage.create(this._createActionMessageData(item, hasTargets, targetIds))
          : await this._createDefaultChat(item);
      }

      return {
        success: true,
        message,
        roll,
        isCritical,
        d20Result,
        hasTargets,
        targets
      };
    } catch (error) {
      game.system.log.e("Error in action handler", error);
      ui.notifications.error(game.i18n.format("FF15.Errors.ActionHandlingFailed", { target: this.actor.name }));
      return { success: false, message: null };
    }
  }

  /**
   * Create message data for an action
   * @private
   */
  _createActionMessageData(item, hasTargets, targets, roll = null, isCritical = false) {
    const messageData = {
      id: `${SYSTEM_ID}--actor-sheet-${generateRandomElementId()}`,
      speaker: game.settings.get(SYSTEM_ID, 'chatMessageSenderIsActorOwner') ? ChatMessage.getSpeaker({ actor: this.actor }) : null,
      flavor: `${item.name}`,
      style: CONST.CHAT_MESSAGE_STYLES.ROLL,
      rolls: roll ? [roll] : [],
      flags: {
        [SYSTEM_ID]: {
          data: {
            chatTemplate: "ActionRollChat",
            actor: {
              _id: this.actor._id,
              uuid: this.actor.uuid,
              name: this.actor.name,
              img: this.actor.img
            },
            item: {
              _id: item._id,
              uuid: item.uuid,
              name: item.name,
              img: item.img,
              type: item.type,
              system: {
                baseEffectHealing: item.system?.baseEffectHealing,
                baseEffectDamage: item.system?.baseEffectDamage,
                directHitDamage: item.system?.directHitDamage,
                hasDirectHit: item.system?.hasDirectHit,
                CR: item.system?.CR,
                isHealerRecovery: Boolean(item?.system?.baseEffectHealing)
              }
            },
            hasTargets,
            targets,
            isSuccess: false,
            isCritical: false,
            d20Result: null
          },
          state: {
            damageResults: false,
            initialised: false
          },
          css: `leather ${isCritical ? 'crit' : ''}`
        }
      }
    };

    if (roll) {
      messageData.flags[SYSTEM_ID].data.roll = roll.total;
    }

    return messageData;
  }

  /**
   * Handle roll with modifiers
   * @private
   */
  async _handleRollWithModifiers(item) {
    let [diceCount, diceType] = [1, 20];
    let formula = '';

    // Get modifiers from the actor
    const modifiers = this.actor.getRollModifiers?.() || {};
    if (modifiers.extraModifiers) {
      const { bonusDice, penalty } = modifiers.extraModifiers;
      if (bonusDice) {
        diceCount += parseInt(bonusDice);
        diceType = '20kh1';
      }
      formula = `${diceCount}d${diceType}${penalty ? ` - ${penalty}` : ''}`;
    }

    // Handle attribute check
    const { rollFormula, rollData } = await this._handleAttributeCheck(item, formula);
    const roll = await new Roll(rollFormula, rollData).evaluate();
    
    // Handle critical hit detection
    const criticalInfo = await this._handleCriticalHit(roll, item);
    const { isCritical, d20Result } = criticalInfo;

    game.system.log.o('[ABILITY:ROLL] Roll result:', {
      itemName: item.name,
      rollTotal: roll.total,
      isCritical,
      d20Result
    });

    return {
      roll,
      isCritical,
      d20Result
    };
  }

  /**
   * Handle critical hit detection and processing
   * @private
   */
  async _handleCriticalHit(roll, item) {
    // Get the d20 result safely
    const d20Term = roll.terms?.[0];
    if (!d20Term) {
      game.system.log.w("[CRITICAL] No d20 term found in roll:", roll);
      return { isCritical: false, d20Result: 0 };
    }

    // Get the highest result if using advantage (kh1), otherwise use first result
    const d20Result = d20Term.modifiers?.includes('kh1')
      ? Math.max(...d20Term.results.map(r => r.result))
      : d20Term.results?.[0]?.result ?? 0;

    // Check if it's a critical hit (natural 20)
    const isCritical = d20Result === 20;

    game.system.log.d("[CRITICAL] Critical hit check:", {
      d20Result,
      isCritical,
      itemName: item.name,
      isHealerRecovery: Boolean(item?.system?.baseEffectHealing)
    });

    // If it's a critical hit, we need to:
    // 1. Double the damage/healing dice
    // 2. Auto-succeed the check
    if (isCritical) {
      // Double all damage/healing dice formulas
      const formulaFields = Boolean(item?.system?.baseEffectHealing) 
        ? ['baseEffectHealing'] // Only double healing for healer recovery skills
        : ['directHitDamage', 'baseEffectDamage']; // Double damage for other skills

      for (const field of formulaFields) {
        const formula = item.system?.[field];
        if (formula) {
          // Double the number of dice in all dice expressions
          const modifiedFormula = formula.replace(/(\d+)d(\d+)/g, (match, count, sides) => {
            return `${parseInt(count) * 2}d${sides}`;
          });
          item.system[field] = modifiedFormula;

          game.system.log.d("[CRITICAL] Modified formula:", {
            field,
            original: formula,
            modified: modifiedFormula
          });
        }
      }
    }

    return {
      isCritical,
      d20Result,
      // Return original roll formula for reference
      originalFormulas: {
        directHitDamage: item.system?.directHitDamage,
        baseEffectDamage: item.system?.baseEffectDamage
      }
    };
  }

  /**
   * Handle attribute check
   * @private
   */
  async _handleAttributeCheck(item, rollFormula, rollData = {}) {
    // Add attribute check if specified
    if (item.system.hasCheck) {
      const attrVal = this.actor.system.attributes.primary[item.system.checkAttribute]?.val || 0;
      rollData[item.system.checkAttribute] = attrVal;
      rollFormula += ` + @${item.system.checkAttribute}`;
    }
    return { rollFormula, rollData };
  }

  /**
   * Create a default chat message for an item
   * @private
   */
  async _createDefaultChat(item) {
    return await ChatMessage.create({
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
              _id: item._id,
              uuid: item.uuid,
              name: item.name,
              img: item.img,
              type: item.type,
              system: item.system
            }
          }
        }
      }
    });
  }
} 