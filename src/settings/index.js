import { SYSTEM_CODE, SYSTEM_ID } from "~/src/helpers/constants";
import { localize } from "#runtime/svelte/helper";

export function registerSettings() {

  /** User settings */
  dontShowWelcome();
  applicationWindowHeaderIconsOnly()
}


function dontShowWelcome() {
  game.settings.register(SYSTEM_ID, 'dontShowWelcome', {
    name: localize(`${SYSTEM_CODE}.Setting.DontShowWelcome.Name`),
    hint: localize(`${SYSTEM_CODE}.Setting.DontShowWelcome.Hint`),
    scope: 'user',
    config: true,
    default: false,
    type: Boolean,
  });
}
function applicationWindowHeaderIconsOnly() {
  game.settings.register(SYSTEM_ID, 'applicationWindowHeaderIconsOnly', {
    name: localize(`${SYSTEM_CODE}.Setting.applicationWindowHeaderIconsOnly.Name`),
    hint: localize(`${SYSTEM_CODE}.Setting.applicationWindowHeaderIconsOnly.Hint`),
    scope: 'user',
    config: true,
    default: false,
    type: Boolean,
  });
}