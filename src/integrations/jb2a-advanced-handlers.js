import { SYSTEM_ID } from "~/src/helpers/constants.js";
import { getJB2ASettings } from "~/src/settings/jb2a-settings.js";

/**
 * Advanced JB2A handlers for Final Fantasy XIV specific features
 */

/**
 * Enhanced animation processing with FF-specific logic
 * @param {Object} jb2aData - The extracted JB2A data
 * @return {Promise<void>}
 */
export async function processAdvancedFFXIVAnimation(jb2aData) {
  const settings = getJB2ASettings();
  
  if (!settings.enabled) return;

  try {
    // Add delay if configured
    if (settings.animationDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, settings.animationDelay));
    }

    // Enhance the handler with FF-specific data
    const enhancedHandler = await enhanceHandlerWithFFData(jb2aData);

    if (settings.debugMode) {
      console.log(`[${SYSTEM_ID}] Enhanced JB2A handler:`, enhancedHandler);
    }

    // Process with JB2A
    if (window.AutomatedAnimations?.trafficCop) {
      await window.AutomatedAnimations.trafficCop(enhancedHandler);
    }

    // Handle additional FF-specific animations
    await processFFSpecificAnimations(enhancedHandler);

  } catch (error) {
    console.error(`[${SYSTEM_ID}] Error in advanced JB2A processing:`, error);
  }
}

/**
 * Enhance the JB2A handler with Final Fantasy specific data
 * @param {Object} jb2aData - The base JB2A data
 * @return {Promise<Object>} Enhanced handler
 */
async function enhanceHandlerWithFFData(jb2aData) {
  const { item, sourceToken, targets, rollType, systemData } = jb2aData;
  
  const handler = {
    item,
    sourceToken,
    targets,
    rollType,
    
    // Enhanced FF-specific properties
    ffxiv: {
      actionType: getActionType(item),
      elementType: getElementType(item),
      jobClass: getJobClass(sourceToken?.actor),
      isCritical: systemData.isCritical || false,
      isDirectHit: hasDirectHit(item),
      damageType: getDamageType(item),
      healingType: getHealingType(item),
      range: getRange(item),
      areaEffect: getAreaEffect(item)
    }
  };

  return handler;
}

/**
 * Get the Final Fantasy action type
 * @param {Item} item - The item
 * @return {string} The action type
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
 * Get the elemental type of the action
 * @param {Item} item - The item
 * @return {string|null} The element type
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
 * Get the job class from the actor
 * @param {Actor} actor - The actor
 * @return {string|null} The job class
 */
function getJobClass(actor) {
  if (!actor) return null;
  
  const jobItems = actor.items.filter(i => i.type === "job");
  const activeJob = jobItems.find(j => j.system?.active);
  
  return activeJob?.name?.toLowerCase() || null;
}

/**
 * Check if the item has direct hit capability
 * @param {Item} item - The item
 * @return {boolean} True if has direct hit
 */
function hasDirectHit(item) {
  return Boolean(item?.system?.hasDirectHit);
}

/**
 * Get the damage type
 * @param {Item} item - The item
 * @return {string|null} The damage type
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

/**
 * Get the healing type
 * @param {Item} item - The item
 * @return {string|null} The healing type
 */
function getHealingType(item) {
  if (item?.system?.baseEffectHealing) {
    return item.system.baseEffectHealingType || "target";
  }
  return null;
}

/**
 * Get the range of the action
 * @param {Item} item - The item
 * @return {string|null} The range
 */
function getRange(item) {
  return item?.system?.range || null;
}

/**
 * Get area effect information
 * @param {Item} item - The item
 * @return {Object|null} Area effect data
 */
function getAreaEffect(item) {
  if (!item?.system?.range) return null;
  
  const range = item.system.range;
  const areaEffects = ["3x3a", "3x3aa", "5x5a", "5x5e", "5x5i"];
  
  if (areaEffects.includes(range)) {
    return {
      type: "area",
      shape: range,
      hasSplitDamage: Boolean(item.system.hasSplitDamage)
    };
  }
  
  return null;
}

/**
 * Process Final Fantasy specific animations
 * @param {Object} handler - The enhanced handler
 * @return {Promise<void>}
 */
async function processFFSpecificAnimations(handler) {
  const settings = getJB2ASettings();
  
  // Handle critical hit effects
  if (handler.ffxiv?.isCritical) {
    await processCriticalHitAnimation(handler);
  }
  
  // Handle direct hit effects
  if (handler.ffxiv?.isDirectHit && handler.targets?.length > 0) {
    await processDirectHitAnimation(handler);
  }
  
  // Handle job-specific effects
  if (handler.ffxiv?.jobClass) {
    await processJobSpecificAnimation(handler);
  }
  
  // Handle elemental effects
  if (handler.ffxiv?.elementType) {
    await processElementalAnimation(handler);
  }
}

/**
 * Process critical hit animation
 * @param {Object} handler - The handler
 * @return {Promise<void>}
 */
async function processCriticalHitAnimation(handler) {
  const settings = getJB2ASettings();
  
  if (settings.debugMode) {
    console.log(`[${SYSTEM_ID}] Processing critical hit animation`);
  }
  
  // Add critical hit visual effects to targets
  if (handler.targets?.length > 0) {
    for (const target of handler.targets) {
      if (target && window.AutomatedAnimations) {
        // You could add specific critical hit animations here
        // This is a placeholder for custom critical animations
      }
    }
  }
}

/**
 * Process direct hit animation
 * @param {Object} handler - The handler
 * @return {Promise<void>}
 */
async function processDirectHitAnimation(handler) {
  const settings = getJB2ASettings();
  
  if (settings.debugMode) {
    console.log(`[${SYSTEM_ID}] Processing direct hit animation`);
  }
  
  // Add direct hit visual effects
  // This is a placeholder for custom direct hit animations
}

/**
 * Process job-specific animations
 * @param {Object} handler - The handler
 * @return {Promise<void>}
 */
async function processJobSpecificAnimation(handler) {
  const settings = getJB2ASettings();
  const jobClass = handler.ffxiv?.jobClass;
  
  if (settings.debugMode) {
    console.log(`[${SYSTEM_ID}] Processing ${jobClass} job animation`);
  }
  
  // Job-specific effects could be added here
  // For example, different casting animations for different jobs
}

/**
 * Process elemental animations
 * @param {Object} handler - The handler
 * @return {Promise<void>}
 */
async function processElementalAnimation(handler) {
  const settings = getJB2ASettings();
  const element = handler.ffxiv?.elementType;
  
  if (settings.debugMode) {
    console.log(`[${SYSTEM_ID}] Processing ${element} elemental animation`);
  }
  
  // Elemental effects could be added here
  // For example, fire spells could have additional flame effects
}

/**
 * Hook for damage application animations
 * @param {Object} damageData - Damage application data
 * @return {Promise<void>}
 */
export async function processDamageApplicationAnimation(damageData) {
  const settings = getJB2ASettings();
  
  if (!settings.enabled || !settings.animateOnDamage) return;
  
  try {
    if (settings.debugMode) {
      console.log(`[${SYSTEM_ID}] Processing damage application animation:`, damageData);
    }
    
    // Add damage application effects
    // This could include hit effects, damage numbers, etc.
    
  } catch (error) {
    console.error(`[${SYSTEM_ID}] Error in damage application animation:`, error);
  }
} 