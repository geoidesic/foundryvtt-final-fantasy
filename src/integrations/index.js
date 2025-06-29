/**
 * Integration modules for the Final Fantasy XIV system
 * Includes JB2A animations and other third-party module integrations
 */

// Automated Animations Integration
import { initializeJB2AIntegration, registerAutomatedAnimationsHooks } from './jb2a-animations.js';
import { testJB2AIntegration, createTestActionItem, simulateTestAction, registerTestUtilities } from './jb2a-test-utils.js';
import { registerJB2ASettings, getJB2ASettings } from '../settings/jb2a-settings.js';

// Re-export for external use
export { 
  initializeJB2AIntegration, 
  registerAutomatedAnimationsHooks,
  testJB2AIntegration, 
  createTestActionItem, 
  simulateTestAction, 
  registerTestUtilities,
  registerJB2ASettings, 
  getJB2ASettings
};

/**
 * Initialize all integrations
 * @return {void}
 */
export function initializeAllIntegrations() {
  // Initialize JB2A if available
  try {
    initializeJB2AIntegration();
  } catch (error) {
    console.warn(`[FFXIV] JB2A integration failed to initialize:`, error);
  }
}

/**
 * Register all integration settings
 * @return {void}
 */
export function registerAllIntegrationSettings() {
  // Register JB2A settings if module is available
  try {
    registerJB2ASettings();
  } catch (error) {
    console.warn(`[FFXIV] JB2A settings failed to register:`, error);
  }
}

/**
 * Register all integration test utilities
 * @return {void}
 */
export function registerAllIntegrationTestUtils() {
  try {
    registerTestUtilities();
  } catch (error) {
    console.warn(`[FFXIV] Integration test utilities failed to register:`, error);
  }
} 