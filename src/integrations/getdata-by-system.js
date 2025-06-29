import { SYSTEM_ID } from "~/src/helpers/constants.js";

/**
 * System data handler for Automated Animations
 * This file contains the static async function that Automated Animations calls
 * to extract system data for the Final Fantasy XIV system
 * 
 * Following the pattern from: https://wiki.theripper93.com/free/autoanimations#compiling-system-data
 */

/**
 * Extract Final Fantasy XIV system data for Automated Animations
 * This is the main function that Automated Animations will call
 * @param {ChatMessage|Object} input - The chat message or hook data
 * @param {boolean} isChat - Whether this is from a chat message
 * @return {Promise<Object|null>} The compiled system data or null
 */
export async function foundryvttFinalFantasy(input, isChat = true) {
  try {
    // For FF XIV, we primarily use chat messages
    if (!isChat || !input) {
      return null;
    }

    const message = input;
    const systemData = message.flags?.[SYSTEM_ID]?.data;
    
    if (!systemData) {
      return null;
    }

    // Check if this is an action message that should trigger animations
    if (!isFFXIVAnimationMessage(systemData)) {
      return null;
    }

    // Extract the required data
    const item = await getItemFromSystemData(systemData);
    if (!item) return null;

    const sourceToken = getSourceTokenFromSystemData(systemData);
    if (!sourceToken) return null;

    const targets = getTargetsFromSystemData(systemData);

    // Return the handler structure expected by Automated Animations
    return {
      item,
      sourceToken,
      targets: targets || [],
      hitTargets: targets || [], // Assume all targets are hit for FF XIV
      playOnMiss: false,
      // Additional FF XIV metadata for animation selection
      workflow: {
        isCritical: systemData.isCritical || false,
        isDirectHit: item?.system?.hasDirectHit || false,
        elementType: getElementType(item),
        actionType: getActionType(item),
        rollType: determineRollType(systemData, message)
      }
    };

  } catch (error) {
    console.error(`[${SYSTEM_ID}] Error in foundryvttFinalFantasy data extraction:`, error);
    return null;
  }
}

/**
 * Check if this is an action message that should trigger animations
 * @param {Object} systemData - The system data from message flags
 * @return {boolean} True if this should trigger animations
 */
function isFFXIVAnimationMessage(systemData) {
  // Check for action-based chat templates
  const actionTemplates = ["ActionRollChat", "RollChat"];
  
  return actionTemplates.includes(systemData.chatTemplate) && 
         systemData.item?.type === "action";
}

/**
 * Get item from system data
 * @param {Object} systemData - System flags data
 * @return {Promise<Item|null>} The item or null
 */
async function getItemFromSystemData(systemData) {
  if (!systemData.item?.uuid) return null;
  
  try {
    return await fromUuid(systemData.item.uuid);
  } catch (error) {
    console.error(`[${SYSTEM_ID}] Error getting item:`, error);
    return null;
  }
}

/**
 * Get source token from system data
 * @param {Object} systemData - System flags data
 * @return {Token|null} The source token or null
 */
function getSourceTokenFromSystemData(systemData) {
  if (!systemData.actor?._id) return null;
  
  const actor = game.actors.get(systemData.actor._id);
  if (!actor) return null;
  
  // Find the token for this actor on the current scene
  return canvas.tokens.placeables.find(t => t.actor?.id === actor.id) || null;
}

/**
 * Get targets from system data
 * @param {Object} systemData - System flags data
 * @return {Array<Token>} Array of target tokens
 */
function getTargetsFromSystemData(systemData) {
  if (!systemData.targets || !Array.isArray(systemData.targets)) {
    return [];
  }
  
  return systemData.targets
    .map(targetId => canvas.tokens.get(targetId))
    .filter(token => token !== null);
}

/**
 * Determine the roll type for animation selection
 * @param {Object} systemData - System flags data
 * @param {ChatMessage} message - The chat message
 * @return {string} The roll type
 */
function determineRollType(systemData, message) {
  // Check if this is an initial action use (attack roll)
  if (systemData.chatTemplate === "ActionRollChat" && message.rolls?.length > 0) {
    return "attack";
  }
  
  // Check if this has damage components
  if (systemData.item?.system?.baseEffectDamage || 
      systemData.item?.system?.directHitDamage) {
    return "damage";
  }
  
  // Check if this is a healing action
  if (systemData.item?.system?.baseEffectHealing) {
    return "heal";
  }
  
  // Default to generic action
  return "action";
}

/**
 * Get elemental type from item
 * @param {Item} item - The item
 * @return {string|null} Element type
 */
function getElementType(item) {
  if (item?.system?.aspected) {
    return item.system.aspected;
  }
  
  // Check tags for elemental types
  const tags = item?.system?.tags || [];
  const elementTags = tags.filter(tag => 
    ["fire", "ice", "lightning", "earth", "wind", "water"].includes(tag.toLowerCase())
  );
  
  return elementTags.length > 0 ? elementTags[0].toLowerCase() : null;
}

/**
 * Get action type from item
 * @param {Item} item - The item
 * @return {string} Action type
 */
function getActionType(item) {
  if (!item?.system?.type) return "unknown";
  
  const typeMap = {
    "primary": "weaponskill",
    "secondary": "spell", 
    "reaction": "reaction",
    "limit": "limitbreak",
    "combo": "combo"
  };
  
  return typeMap[item.system.type] || item.system.type;
} 