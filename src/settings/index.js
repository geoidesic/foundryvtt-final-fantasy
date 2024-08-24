import { SYSTEM_CODE, SYSTEM_ID } from "~/src/helpers/constants";
import { localize } from "#runtime/svelte/helper";
import { gameSettings } from '~/src/config/gameSettings';

export function registerSettings() {
  /** User settings */
  dontShowWelcome();
  applicationWindowHeaderIconsOnly()
  confirmBeforeDeletingActorItem()
}

function dontShowWelcome() {
  gameSettings.register({
    namespace: SYSTEM_ID,
    key: 'dontShowWelcome',
    options: {
      name: localize(`${SYSTEM_CODE}.Setting.DontShowWelcome.Name`),
      hint: localize(`${SYSTEM_CODE}.Setting.DontShowWelcome.Hint`),
      scope: 'user',
      config: true,
      default: false,
      type: Boolean
    }
  });
}
function applicationWindowHeaderIconsOnly() {
  gameSettings.register({
    namespace: SYSTEM_ID,
    key: 'applicationWindowHeaderIconsOnly',
    options: {
      name: localize(`${SYSTEM_CODE}.Setting.applicationWindowHeaderIconsOnly.Name`),
      hint: localize(`${SYSTEM_CODE}.Setting.applicationWindowHeaderIconsOnly.Hint`),
      scope: 'user',
      config: true,
      default: false,
      type: Boolean
    }
  });
}
function confirmBeforeDeletingActorItem() {
  gameSettings.register({
    namespace: SYSTEM_ID,
    key: 'confirmBeforeDeletingActorItem',
    options: {
      name: localize(`${SYSTEM_CODE}.Setting.confirmBeforeDeletingActorItem.Name`),
      hint: localize(`${SYSTEM_CODE}.Setting.confirmBeforeDeletingActorItem.Hint`),
      scope: 'user',
      config: true,
      default: true,
      type: Boolean
    }
  });
}