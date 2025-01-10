/**
 * Sets up Dice So Nice module configuration
 * @return {void}
 */
export function setupDSN() {
  // Set up Dice So Nice to incrementally show attacks then damage rolls
  if (game.modules.get("dice-so-nice")?.active && !game.settings.get(game.system.id, ICON.settings.dsn_setup)) {
    game.settings.set("dice-so-nice", "enabledSimultaneousRolls", true);
    game.settings.set("dice-so-nice", "enabledSimultaneousRollForMessage", true);
    game.settings.set("dice-so-nice", "immediatelyDisplayChatMessages", true);
    game.settings.set(game.system.id, ICON.settings.dsn_setup, true);
  }
} 