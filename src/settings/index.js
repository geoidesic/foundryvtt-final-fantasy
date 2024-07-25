import { SYSTEM_ID } from "~/src/helpers/constants";

export function registerSettings() {

  /** User settings */
  dontShowWelcome();

}


function dontShowWelcome() {
  game.settings.register(SYSTEM_ID, 'dontShowWelcome', {
    name: game.i18n.localize('GAS.Setting.DontShowWelcome.Name'),
    hint: game.i18n.localize('GAS.Setting.DontShowWelcome.Hint'),
    scope: 'user',
    config: true,
    default: false,
    type: Boolean,
  });
}