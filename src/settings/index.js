import { localize } from "#runtime/svelte/helper";
import { SYSTEM_CODE, SYSTEM_ID } from "~/src/helpers/constants";
import { gameSettings } from '~/src/config/gameSettings';

export function registerSettings() {
  /** User settings */
  dontShowWelcome();
  applicationWindowHeaderIconsOnly()
  confirmBeforeDeletingActorItem()
  combatStartSound()
  chatMessageSound()
  showStatusEffectNames()
  manualInitiative()
  showChatProfileImages()
  chatMessageSenderIsActorOwner()
}

function chatMessageSenderIsActorOwner() {
  gameSettings.register({
    namespace: SYSTEM_ID,
    key: 'chatMessageSenderIsActorOwner',
    options: {
      name: localize(`${SYSTEM_CODE}.Setting.chatMessageSenderIsActorOwner.Name`),
      hint: localize(`${SYSTEM_CODE}.Setting.chatMessageSenderIsActorOwner.Hint`),
      scope: 'user',
      config: true,
      default: true,
      type: Boolean
    }
  });
}

function manualInitiative() {

  gameSettings.register({
    namespace: SYSTEM_ID,
    key: 'manual-initiative',
    options: {
      name: localize(`${SYSTEM_CODE}.Setting.ManualInitiative.Name`),
      hint: localize(`${SYSTEM_CODE}.Setting.ManualInitiative.Hint`),
      scope: 'world',
      config: true,
      default: true,
      type: Boolean
    }
  });
}
function showStatusEffectNames() {

  gameSettings.register({
    namespace: SYSTEM_ID,
    key: 'show-status-effect-names',
    options: {
      name: localize(`${SYSTEM_CODE}.Setting.ShowStatusEffects.Name`),
      hint: localize(`${SYSTEM_CODE}.Setting.ShowStatusEffects.Hint`),
      scope: 'world',
      config: true,
      default: true,
      type: Boolean
    }
  });
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
function combatStartSound() {
  gameSettings.register({
    namespace: SYSTEM_ID,
    key: 'combatStartSound',
    options: {
      name: localize(`${SYSTEM_CODE}.Setting.combatStartSound.Name`),
      hint: localize(`${SYSTEM_CODE}.Setting.combatStartSound.Hint`),
      scope: 'user',
      config: true,
      default: 'sounds/drums.wav',
      type: String,
      filePicker: "any",
    }
  });
}
function chatMessageSound() {
  gameSettings.register({
    namespace: SYSTEM_ID,
    key: 'chatMessageSound',
    options: {
      name: localize(`${SYSTEM_CODE}.Setting.chatMessageSound.Name`),
      hint: localize(`${SYSTEM_CODE}.Setting.chatMessageSound.Hint`),
      scope: 'user',
      config: true,
      default: `sounds/notify.wav`,
      type: String,
      filePicker: "any",
    }
  });
}
function showChatProfileImages() {
  gameSettings.register({
    namespace: SYSTEM_ID,
    key: 'showChatProfileImages',
    options: {
      name: localize(`${SYSTEM_CODE}.Setting.showChatProfileImages.Name`),
      hint: localize(`${SYSTEM_CODE}.Setting.showChatProfileImages.Hint`),
      scope: 'user',
      config: true,
      default: true,
      type: Boolean
    }
  });
}