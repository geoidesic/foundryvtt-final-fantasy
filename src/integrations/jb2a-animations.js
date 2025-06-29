import { SYSTEM_ID } from "~/src/helpers/constants.js";
import { systemHooks } from "./autoanimations-system-support.js";

/**
 * Automated Animations Integration for Final Fantasy XIV System
 * This module provides integration with TheRipper93's Automated Animations module
 * Following the documentation at: https://wiki.theripper93.com/free/autoanimations
 */

/**
 * Register system hooks for Automated Animations
 * This follows TheRipper93's new structure where we just register the system hooks
 * and let the module handle the workflow internally
 * @return {void}
 */
export function registerAutomatedAnimationsHooks() {
  if (!game.modules.get("autoanimations")?.active) {
    return;
  }

  console.log(`[${SYSTEM_ID}] Registering Automated Animations system support`);

  // Register our system hooks with the module
  systemHooks();
}

/**
 * Initialize Automated Animations integration
 * Called during system initialization
 * @return {void}
 */
export function initializeJB2AIntegration() {
  // Register hooks when ready
  Hooks.once("ready", () => {
    registerAutomatedAnimationsHooks();
  });
} 