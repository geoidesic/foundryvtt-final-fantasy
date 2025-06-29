import { SYSTEM_ID } from "~/src/helpers/constants.js";

/**
 * Register Automated Animations settings for the Final Fantasy XIV system
 * @return {void}
 */
export function registerJB2ASettings() {
  // Only register settings if Automated Animations is active
  if (!game.modules.get("autoanimations")?.active) {
    return;
  }

  console.log(`[${SYSTEM_ID}] Registering Automated Animations settings`);

  // Enable/disable Automated Animations integration
  game.settings.register(SYSTEM_ID, "enableAutomatedAnimationsIntegration", {
    name: "FFXIV.Settings.AutomatedAnimations.EnableIntegration.Name",
    hint: "FFXIV.Settings.AutomatedAnimations.EnableIntegration.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      console.log(`[${SYSTEM_ID}] Automated Animations Integration ${value ? 'enabled' : 'disabled'}`);
    }
  });

  // Animation delay for better synchronization
  game.settings.register(SYSTEM_ID, "automatedAnimationsDelay", {
    name: "FFXIV.Settings.AutomatedAnimations.AnimationDelay.Name",
    hint: "FFXIV.Settings.AutomatedAnimations.AnimationDelay.Hint",
    scope: "world",
    config: true,
    type: Number,
    default: 500,
    range: {
      min: 0,
      max: 2000,
      step: 100
    }
  });

  // Debug mode for Automated Animations integration
  game.settings.register(SYSTEM_ID, "automatedAnimationsDebugMode", {
    name: "FFXIV.Settings.AutomatedAnimations.DebugMode.Name",
    hint: "FFXIV.Settings.AutomatedAnimations.DebugMode.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
}

/**
 * Get Automated Animations integration settings
 * @return {Object} Settings object
 */
export function getJB2ASettings() {
  return {
    enabled: game.settings.get(SYSTEM_ID, "enableAutomatedAnimationsIntegration"),
    animationDelay: game.settings.get(SYSTEM_ID, "automatedAnimationsDelay"),
    debugMode: game.settings.get(SYSTEM_ID, "automatedAnimationsDebugMode")
  };
} 