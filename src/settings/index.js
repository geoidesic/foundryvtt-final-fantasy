import { SYSTEM_ID } from "~/src/helpers/constants";
import { localize } from '~/src/helpers/util'
import { gameSettings } from '~/src/config/gameSettings';

export function registerSettings() {
//   /** User settings */
  dontShowWelcome();
  applicationWindowHeaderIconsOnly()
  confirmBeforeDeletingActorItem()
  combatStartSound()
  chatMessageSound()
  showStatusEffectNames()
  manualInitiative()
  showChatProfileImages()
  chatMessageSenderIsActorOwner()
  automaticUses()
  defaultChatDescriptionVisible()
}

/**
 * Some abilities have limitations on how many times they can be used.
 * This setting controls whether the system should automatically deduct uses from the actor's pool when an ability is used.
 * If disabled, the user will be prompted to deduct uses from the actor's pool when an ability is used.
 */
function automaticUses() {
  gameSettings.register({
    namespace: SYSTEM_ID,
    key: 'automaticUses',
    options: {
      name: localize('Setting.automaticUses.Name'),
      hint: localize('Setting.automaticUses.Hint'),
      scope: 'user',
      config: true,
      default: true,
      type: Boolean
    }
  });
}

function chatMessageSenderIsActorOwner() {
  gameSettings.register({
    namespace: SYSTEM_ID,
    key: 'chatMessageSenderIsActorOwner',
    options: {
      name: localize('Setting.chatMessageSenderIsActorOwner.Name'),
      hint: localize('Setting.chatMessageSenderIsActorOwner.Hint'),
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
      name: localize('Setting.ManualInitiative.Name'),
      hint: localize('Setting.ManualInitiative.Hint'),
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
      name: localize('Setting.ShowStatusEffects.Name'),
      hint: localize('Setting.ShowStatusEffects.Hint'),
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
      name: localize('Setting.DontShowWelcome.Name'),
      hint: localize('Setting.DontShowWelcome.Hint'),
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
      name: localize('Setting.applicationWindowHeaderIconsOnly.Name'),
      hint: localize('Setting.applicationWindowHeaderIconsOnly.Hint'),
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
      name: localize('Setting.confirmBeforeDeletingActorItem.Name'),
      hint: localize('Setting.confirmBeforeDeletingActorItem.Hint'),
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
      name: localize('Setting.combatStartSound.Name'),
      hint: localize('Setting.combatStartSound.Hint'),
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
      name: localize('Setting.chatMessageSound.Name'),
      hint: localize('Setting.chatMessageSound.Hint'),
      scope: 'user',
      config: true,
      default: 'sounds/notify.wav',
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
      name: localize('Setting.showChatProfileImages.Name'),
      hint: localize('Setting.showChatProfileImages.Hint'),
      scope: 'user',
      config: true,
      default: true,
      type: Boolean
    }
  });
}

function defaultChatDescriptionVisible() {
  gameSettings.register({
    namespace: SYSTEM_ID,
    key: 'defaultChatDescriptionVisible',
    options: {
      name: localize('Setting.DefaultChatDescriptionVisible.Name'),
      hint: localize('Setting.DefaultChatDescriptionVisible.Hint'),
      scope: 'world',
      config: true,
      default: false,
      type: Boolean
    }
  });
}