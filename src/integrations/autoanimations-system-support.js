import { SYSTEM_ID } from "~/src/helpers/constants.js";

/**
 * System support for Automated Animations (TheRipper93's version)
 * Following the structure from: https://wiki.theripper93.com/free/autoanimations
 */

/**
 * System hooks function for Final Fantasy XIV
 * This is the main entry point that Automated Animations will call
 * @return {void}
 */
export function systemHooks() {
  console.log(`[${SYSTEM_ID}] Registering Automated Animations system hooks`);
  
  // Register the createChatMessage hook for FF XIV
  Hooks.on("createChatMessage", async (message) => {
    // Only process on the user's client to prevent duplicate animations
    if (message.user.id !== game.user.id) return;
    
    // Check if this is a relevant FF XIV message
    if (!isFFXIVAnimationMessage(message)) return;
    
    try {
      // Use the Automated Animations workflow
      const handler = await window.AutomatedAnimations?.systemData?.make?.(message);
      
      if (!handler || !handler.item || !handler.sourceToken) {
        return;
      }
      
      // Send to traffic cop for processing
      if (window.AutomatedAnimations?.autoAnimations?.trafficCop) {
        await window.AutomatedAnimations.autoAnimations.trafficCop(handler);
      }
      
    } catch (error) {
      console.error(`[${SYSTEM_ID}] Error in Automated Animations processing:`, error);
    }
  });
}

/**
 * Check if a chat message should trigger animations
 * @param {ChatMessage} message - The chat message
 * @return {boolean} True if this message should trigger animations
 */
function isFFXIVAnimationMessage(message) {
  const systemData = message.flags?.[SYSTEM_ID]?.data;
  
  if (!systemData) return false;
  
  // Check for action-based messages that should trigger animations
  const actionTemplates = ["ActionRollChat", "RollChat"];
  
  return actionTemplates.includes(systemData.chatTemplate) && 
         systemData.item?.type === "action";
}

/**
 * Extract Final Fantasy XIV system data for Automated Animations
 * This function follows the pattern expected by getdata-by-system.js
 * @param {ChatMessage} message - The chat message
 * @return {Promise<Object|null>} The system data or null
 */
export async function extractFFXIVData(message) {
  try {
    const systemData = message.flags?.[SYSTEM_ID]?.data;
    if (!systemData || !isFFXIVAnimationMessage(message)) {
      return null;
    }
    
    // Get the item
    const item = await getItemFromSystemData(systemData);
    if (!item) return null;
    
    // Get the source token
    const sourceToken = getSourceTokenFromSystemData(systemData);
    if (!sourceToken) return null;
    
    // Get targets if any
    const targets = getTargetsFromSystemData(systemData);
    
    // Determine roll type for animation selection
    const rollType = determineRollType(systemData, message);
    
    // Return the handler data structure expected by Automated Animations
    return {
      item,
      sourceToken,
      targets: targets || [],
      hitTargets: targets || [], // For FF XIV, assume all targets are hit unless specified
      playOnMiss: false,
      rollType,
      // Additional FF XIV specific data
      ffxiv: {
        isCritical: systemData.isCritical || false,
        isDirectHit: item?.system?.hasDirectHit || false,
        elementType: getElementType(item),
        actionType: getActionType(item),
        damageType: getDamageType(item)
      }
    };
    
  } catch (error) {
    console.error(`[${SYSTEM_ID}] Error extracting FF XIV data:`, error);
    return null;
  }
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

/**
 * Get damage type from item
 * @param {Item} item - The item
 * @return {string|null} Damage type
 */
function getDamageType(item) {
  if (item?.system?.baseEffectDamage) {
    return "damage";
  }
  if (item?.system?.directHitDamage) {
    return "directhit";
  }
  return null;
} 