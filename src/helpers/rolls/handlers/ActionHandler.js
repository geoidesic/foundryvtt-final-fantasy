import { SYSTEM_ID } from "~/src/helpers/constants";
import { generateRandomElementId } from "~/src/helpers/util";
import DefaultChat from "~/src/helpers/rolls/handlers/DefaultChatHandler";

/**
 * Handles all action-related operations
 */
export default class ActionHandler {
  /**
   * @param {Actor} actor - The actor this handler is for
   */
  constructor(actor) {
    this.actor = actor;
    this.DefaultChat = new DefaultChat(actor);
  }

  /**
   * Handle an action ability
   * @param {Item} item - The action item
   * @param {Object} [options={}] - Additional options
   * @return {Promise<{success: boolean, message: ChatMessage|null}>} Returns result of action handling
   */
  async handle(item, options = {}) {
    try {
      this.options = options;  // Store options for use in other methods
      const { targets, hasTargets, targetIds } = this._getActionTargets();

      let roll;
      let isCritical = false;
      let d20Result = null;
      let isSuccess;

      if (item.system.hasCR) {
        ({ roll, isCritical, d20Result, isSuccess } = await this._rollWithCR(item, targets, hasTargets, targetIds));
      } else {
        // Use DefaultChat if there's no custom action message
        if(item.system.hasBaseEffect && Boolean(item.system.baseEffectDamage)) {
          ChatMessage.create(this._createActionMessageData(item, hasTargets, targetIds))
        } else {
          this.DefaultChat.handle(item);
        }
      }

      return {
        handledSuccessfully: true,
        isCritical,
        roll,
        d20Result,
        hasTargets,
        targets,
        isSuccess
      };
    } catch (error) {
      game.system.log.e("Error in action handler", error);
      ui.notifications.error(
        game.i18n.format("FF15.Errors.ActionHandlingFailed", { target: this.actor.name })
      );
      return { handledSuccessfully: false };
    }
  }

  /**
   * @internal
   * Retrieves targets from the user and checks if they exist.
   */
  _getActionTargets() {
    const targets = game.user.targets;
    const hasTargets = targets.size > 0;
    const targetIds = Array.from(targets).map(target => target.id);
    return { targets, hasTargets, targetIds };
  }

  /**
   * @internal
   * Creates and returns the final message, roll, and critical data if an item uses CR checks.
   */
  async _rollWithCR(item, targets, hasTargets, targetIds) {
    // Handle roll with modifiers
    const { roll, isCritical, d20Result } = await this._handleRollWithModifiers(item);
    let isSuccess = false;
    // Create initial message data
    const messageData = this._createActionMessageData(item, hasTargets, targetIds, roll, isCritical);
    messageData.flags[SYSTEM_ID].data.isCritical = isCritical;
    messageData.flags[SYSTEM_ID].data.d20Result = d20Result;

    // If there are targets, figure out the CR value from the target
    if (hasTargets) {
      const {
        crValue,
        targetActor
      } = this._getTargetCRValue(item, targets);

      // Evaluate success
      isSuccess = this._evaluateSuccess({ roll, crValue, isCritical });
      game.system.log.o('[ABILITY:ROLL] CR check isSuccess:', isSuccess);
      messageData.flags[SYSTEM_ID].data.isSuccess = isSuccess;

      // Log CR check output
      game.system.log.o('[ABILITY:ROLL] CR check:', {
        itemName: item.name,
        rollTotal: roll.total,
        CR: item.system.CR,
        crValue,
        isSuccess,
        isCritical,
        d20Result
      });
    }

    // Send the roll message to the chat
    await roll.toMessage(messageData);
    return { roll, isCritical, d20Result, isSuccess };
  }

  /**
   * @internal
   * Retrieves the CR value from the first target if available.
   */
  _getTargetCRValue(item, targets) {
    const target = targets.values().next().value;
    const targetActor = target?.actor;
    let crValue = 0;

    if (targetActor) {
      if (targetActor.type === "npc") {
        crValue = targetActor.system.attributes[item.system.CR]?.val || 0;
      } else {
        crValue = targetActor.system.attributes.secondary[item.system.CR]?.val || 0;
      }
    }

    return { crValue, targetActor };
  }

  /**
   * @internal
   * Evaluates if a roll is successful based on CR and critical.
   */
  _evaluateSuccess({ roll, crValue, isCritical }) {
    // If critical, auto success. Otherwise compare to CR value.
    return isCritical || roll.total >= crValue;
  }

  /**
   * @internal
   * Create message data for an action
   */
  _createActionMessageData(item, hasTargets, targets, roll = null, isCritical = false) {
    const messageData = {
      id: `${SYSTEM_ID}--actor-sheet-${generateRandomElementId()}`,
      speaker: game.settings.get(SYSTEM_ID, 'chatMessageSenderIsActorOwner')
        ? ChatMessage.getSpeaker({ actor: this.actor })
        : null,
      flavor: `${item.name}`,
      style: CONST.CHAT_MESSAGE_STYLES.ROLL,
      rolls: roll ? [roll] : [],
      flags: {
        [SYSTEM_ID]: {
          data: {
            chatTemplate: "ActionRollChat",
            actor: this._buildActorData(this.actor),
            item: this._buildItemData(item),
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
   * @internal
   * Builds a minimal data object for the actor to embed in a chat flag.
   */
  _buildActorData(actor) {
    return {
      _id: actor._id,
      uuid: actor.uuid,
      name: actor.name,
      img: actor.img
    };
  }

  /**
   * @internal
   * Builds a minimal data object for the item to embed in a chat flag.
   */
  _buildItemData(item) {
    return {
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
    };
  }

  /**
   * @internal
   * Handle roll with modifiers
   */
  async _handleRollWithModifiers(item) {
    // Construct the final roll formula
    const formula = this._constructRollFormulaFromModifiers(item);

    // Combine formula with attribute checks, if any
    const { rollFormula, rollData } = await this._handleAttributeCheck(item, formula);
  
    // Evaluate the roll
    const roll = await new Roll(rollFormula, rollData).evaluate();
    
    // Detect critical hits
    const { isCritical, d20Result } = await this._handleCriticalHit(roll, item);

    game.system.log.o('[ABILITY:ROLL] Roll result:', {
      itemName: item.name,
      rollTotal: roll.total,
      isCritical,
      d20Result
    });

    return { roll, isCritical, d20Result };
  }

  /**
   * @internal
   * Constructs the roll formula by reading actor's extra modifiers.
   */
  _constructRollFormulaFromModifiers(item) {
    let [diceCount, diceType] = [1, 20];
    let formula = '';

    // Get modifiers from the options passed through
    const { bonusDice, penalty } = this.options?.extraModifiers || {};

    // If there's advantage or extra dice, we modify the standard d20
    if (bonusDice) {
      diceCount += parseInt(bonusDice, 10);
      // For advantage-like mechanics, use 'kh1' to keep the highest roll
      diceType = '20kh1';
    }

    // Build the formula piece
    formula = `${diceCount}d${diceType}${penalty ? ` - ${penalty}` : ''}`;
    return formula;
  }

  /**
   * @internal
   * Handle critical hit detection and processing
   */
  async _handleCriticalHit(roll, item) {
    const d20Term = roll.terms?.[0];
    if (!d20Term) {
      game.system.log.w("[CRITICAL] No d20 term found in roll:", roll);
      return { isCritical: false, d20Result: 0 };
    }

    const d20Result = d20Term.modifiers?.includes('kh1')
      ? Math.max(...d20Term.results.map(r => r.result))
      : d20Term.results?.[0]?.result ?? 0;

    const isCritical = d20Result === 20;

    game.system.log.d("[CRITICAL] Critical hit check:", {
      d20Result,
      isCritical,
      itemName: item.name,
      isHealerRecovery: Boolean(item?.system?.baseEffectHealing)
    });

    // If it's a critical hit, double the damage/healing dice
    if (isCritical) {
      this._doubleDamageHealsIfNeeded(item);
    }

    return { isCritical, d20Result };
  }

  /**
   * @internal
   * Doubles relevant "dice" fields if item is a critical hit.
   */
  _doubleDamageHealsIfNeeded(item) {
    // Only double healing for healer recovery skills, otherwise damage.
    const formulaFields = Boolean(item?.system?.baseEffectHealing)
      ? ['baseEffectHealing']
      : ['directHitDamage', 'baseEffectDamage'];

    for (const field of formulaFields) {
      const formula = item.system?.[field];
      if (formula) {
        // Double the number of dice in all dice expressions
        const modifiedFormula = formula.replace(/(\d+)d(\d+)/g, (match, count, sides) => {
          return `${parseInt(count, 10) * 2}d${sides}`;
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

  /**
   * @internal
   * Handle attribute check
   */
  async _handleAttributeCheck(item, rollFormula, rollData = {}) {
    if (item.system.hasCheck) {
      const attrVal = this.actor.system.attributes.primary[item.system.checkAttribute]?.val || 0;
      rollData[item.system.checkAttribute] = attrVal;
      rollFormula += ` + @${item.system.checkAttribute}`;
    }
    return { rollFormula, rollData };
  }
} 