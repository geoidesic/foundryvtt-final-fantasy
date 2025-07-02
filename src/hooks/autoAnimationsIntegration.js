import { SYSTEM_ID } from "~/src/helpers/constants";

let autoAnimationsActive = false;

/**
 * Initialize AutoAnimations integration if the module is available
 */
export function initializeAutoAnimations() {
  try {
    // Check if AutoAnimations module is active
    const autoAnimationsModule = game.modules.get("autoanimations");
    if (!autoAnimationsModule?.active) {
      console.log(`[${SYSTEM_ID}] AutoAnimations module not found or not active`);
      return;
    }

    // Check if AutomatedAnimations API is available
    if (typeof AutomatedAnimations !== 'undefined' && AutomatedAnimations.playAnimation) {
      autoAnimationsActive = true;
      console.log(`[${SYSTEM_ID}] AutoAnimations integration initialized`);
    } else {
      console.warn(`[${SYSTEM_ID}] AutomatedAnimations API not available`);
    }
  } catch (error) {
    console.warn(`[${SYSTEM_ID}] Failed to initialize AutoAnimations integration:`, error);
  }
}

/**
 * Trigger an animation when an item is used
 * @param {Object} item - The item being used
 * @param {Object} sourceActor - The actor using the item
 * @param {Array} targetTokenIds - Array of target token IDs
 */
export async function triggerAnimationFromItemUse(item, sourceActor, targetTokenIds = []) {
  if (!autoAnimationsActive) {
    console.log(`[${SYSTEM_ID}] AutoAnimations not active, skipping animation`);
    return;
  }

  try {
    // Find source token
    const sourceToken = canvas.tokens.placeables.find(t => t.actor?.id === sourceActor.id);
    if (!sourceToken) {
      console.warn(`[${SYSTEM_ID}] No source token found for actor ${sourceActor.name}`);
      return;
    }

    // Get target tokens
    const targetTokens = targetTokenIds.map(id => canvas.tokens.get(id)).filter(Boolean);

    // Prepare options for AutomatedAnimations.playAnimation
    const options = {
      targets: targetTokens,
      hitTargets: targetTokens, // Assume all targets are "hit" for equipment items
      playOnMiss: false
    };

    // Call AutomatedAnimations.playAnimation with the correct API
    await AutomatedAnimations.playAnimation(sourceToken, item, options);

    console.log(`[${SYSTEM_ID}] Triggered AutoAnimations for item: ${item.name}`);
  } catch (error) {
    console.warn(`[${SYSTEM_ID}] Failed to trigger AutoAnimations:`, error);
  }
} 