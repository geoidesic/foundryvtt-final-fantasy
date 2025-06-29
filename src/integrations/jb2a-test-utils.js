import { SYSTEM_ID } from "~/src/helpers/constants.js";
import { getJB2ASettings } from "~/src/settings/jb2a-settings.js";

/**
 * Test utilities for JB2A integration
 */

/**
 * Test if Automated Animations integration is properly configured
 * @return {Promise<Object>} Test results
 */
export async function testJB2AIntegration() {
  const results = {
    overall: false,
    tests: {}
  };

  console.log(`[${SYSTEM_ID}] Running Automated Animations integration tests...`);

  // Test 1: Check if Automated Animations module is active
  results.tests.jb2aModuleActive = testAutomatedAnimationsModuleActive();
  
  // Test 2: Check system settings
  results.tests.systemSettings = testSystemSettings();
  
  // Test 3: Check JB2A APIs
  results.tests.jb2aAPIs = testJB2AAPIs();
  
  // Test 4: Check hook registration
  results.tests.hookRegistration = testHookRegistration();
  
  // Test 5: Check canvas and tokens
  results.tests.canvasTokens = testCanvasTokens();

  // Overall result
  results.overall = Object.values(results.tests).every(test => test.passed);

  // Log results
  logTestResults(results);
  
  return results;
}

/**
 * Test if Automated Animations module is active
 * @return {Object} Test result
 */
function testAutomatedAnimationsModuleActive() {
  const aaModule = game.modules.get("autoanimations");
  const passed = Boolean(aaModule?.active);
  
  return {
    name: "Automated Animations Module Active",
    passed,
    message: passed 
      ? "Automated Animations module is active" 
      : "Automated Animations module is not installed or not active",
    details: {
      installed: Boolean(aaModule),
      active: aaModule?.active || false,
      version: aaModule?.version || "unknown"
    }
  };
}

/**
 * Test system settings
 * @return {Object} Test result
 */
function testSystemSettings() {
  let passed = true;
  let message = "System settings configured correctly";
  const details = {};

  try {
    const settings = getJB2ASettings();
    details.settings = settings;
    
    if (typeof settings.enabled !== 'boolean') {
      passed = false;
      message = "JB2A integration setting not properly configured";
    }
  } catch (error) {
    passed = false;
    message = `Error reading JB2A settings: ${error.message}`;
    details.error = error.message;
  }

  return {
    name: "System Settings",
    passed,
    message,
    details
  };
}

/**
 * Test Automated Animations APIs
 * @return {Object} Test result
 */
function testJB2AAPIs() {
  const checks = {
    automatedAnimations: Boolean(window.AutomatedAnimations),
    playAnimation: Boolean(window.AutomatedAnimations?.playAnimation),
    autorecManager: Boolean(window.AutomatedAnimations?.AutorecManager)
  };

  const passed = checks.automatedAnimations && checks.playAnimation;
  const message = passed 
    ? "Automated Animations APIs are available"
    : "Required Automated Animations APIs are missing";

  return {
    name: "Automated Animations APIs",
    passed,
    message,
    details: checks
  };
}

/**
 * Test hook registration
 * @return {Object} Test result
 */
function testHookRegistration() {
  // This is a basic test - in practice you'd need to check if hooks are actually registered
  const hooks = game.hooks?.events || {};
  const hasCreateChatMessage = Boolean(hooks.createChatMessage?.length > 0);
  const hasFFXIVOnDamage = Boolean(hooks['FFXIV.onDamage']?.length > 0);

  const passed = hasCreateChatMessage;
  const message = passed 
    ? "Required hooks are registered"
    : "Required hooks are not registered";

  return {
    name: "Hook Registration",
    passed,
    message,
    details: {
      createChatMessage: hasCreateChatMessage,
      ffxivOnDamage: hasFFXIVOnDamage,
      totalHooks: Object.keys(hooks).length
    }
  };
}

/**
 * Test canvas and tokens
 * @return {Object} Test result
 */
function testCanvasTokens() {
  const hasCanvas = Boolean(canvas?.ready);
  const hasTokens = Boolean(canvas?.tokens?.placeables?.length > 0);
  
  const passed = hasCanvas;
  const message = hasCanvas 
    ? `Canvas ready with ${canvas?.tokens?.placeables?.length || 0} tokens`
    : "Canvas is not ready";

  return {
    name: "Canvas & Tokens",
    passed,
    message,
    details: {
      canvasReady: hasCanvas,
      tokenCount: canvas?.tokens?.placeables?.length || 0,
      sceneActive: Boolean(canvas?.scene)
    }
  };
}

/**
 * Log test results to console
 * @param {Object} results - Test results
 * @return {void}
 */
function logTestResults(results) {
  console.log(`[${SYSTEM_ID}] JB2A Integration Test Results:`);
  console.log(`Overall: ${results.overall ? '✅ PASS' : '❌ FAIL'}`);
  
  for (const [key, test] of Object.entries(results.tests)) {
    const status = test.passed ? '✅' : '❌';
    console.log(`${status} ${test.name}: ${test.message}`);
    
    if (test.details && Object.keys(test.details).length > 0) {
      console.log(`   Details:`, test.details);
    }
  }
}

/**
 * Create a test action item for animation testing
 * @param {Actor} actor - The actor to create the test item for
 * @return {Promise<Item|null>} The created test item
 */
export async function createTestActionItem(actor) {
  if (!actor) {
    ui.notifications.warn("No actor selected for test item creation");
    return null;
  }

  const testItemData = {
    name: "JB2A Test Action",
    type: "action",
    system: {
      type: "primary",
      description: "A test action for verifying JB2A integration",
      baseEffectDamage: "1d6",
      hasCheck: false,
      target: "single",
      range: "1sq",
      tags: ["test", "fire"]
    }
  };

  try {
    const item = await actor.createEmbeddedDocuments("Item", [testItemData]);
    ui.notifications.info(`Test action "${testItemData.name}" created for ${actor.name}`);
    return item[0];
  } catch (error) {
    console.error(`[${SYSTEM_ID}] Error creating test item:`, error);
    ui.notifications.error("Failed to create test action item");
    return null;
  }
}

/**
 * Simulate using a test action for animation testing
 * @param {Actor} actor - The actor using the action
 * @param {Item} item - The action item to use
 * @return {Promise<void>}
 */
export async function simulateTestAction(actor, item) {
  if (!actor || !item) {
    ui.notifications.warn("Actor and item required for test action simulation");
    return;
  }

  console.log(`[${SYSTEM_ID}] Simulating action: ${item.name} by ${actor.name}`);

  // Create a test chat message that should trigger JB2A
  const messageData = {
    user: game.user.id,
    speaker: ChatMessage.getSpeaker({ actor }),
    flags: {
      [SYSTEM_ID]: {
        data: {
          chatTemplate: "ActionRollChat",
          actor: {
            _id: actor._id,
            name: actor.name,
            img: actor.img
          },
          item: {
            _id: item._id,
            uuid: item.uuid,
            name: item.name,
            img: item.img,
            type: item.type,
            system: item.system
          },
          hasTargets: game.user.targets.size > 0,
          targets: Array.from(game.user.targets).map(t => t.id),
          isCritical: false
        }
      }
    }
  };

  try {
    await ChatMessage.create(messageData);
    ui.notifications.info(`Test action executed - check for animations!`);
  } catch (error) {
    console.error(`[${SYSTEM_ID}] Error simulating test action:`, error);
    ui.notifications.error("Failed to simulate test action");
  }
}

/**
 * Add test utilities to global scope for console access
 * @return {void}
 */
export function registerTestUtilities() {
  if (!game.ffxiv) {
    game.ffxiv = {};
  }
  
  game.ffxiv.jb2aTests = {
    testIntegration: testJB2AIntegration,
    createTestItem: createTestActionItem,
    simulateAction: simulateTestAction
  };

  console.log(`[${SYSTEM_ID}] JB2A test utilities registered. Use game.ffxiv.jb2aTests in console.`);
} 