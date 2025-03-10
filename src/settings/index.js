import { SYSTEM_ID } from "~/src/helpers/constants";
import { localize } from '~/src/helpers/util'
import { gameSettings } from '~/src/config/gameSettings';

/**
 * Registers all game settings for the system.
 * This function initializes various user and world settings that control
 * system behavior and preferences.
 * @return {void}
 */
export function registerSettings() {
  /** User settings */
  dontShowWelcome();
  applicationWindowHeaderIconsOnly()
  confirmBeforeDeletingActorItem()
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
 * @return {void}
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


/**
 * Controls whether chat messages should display the actor owner as the sender.
 * When enabled, chat messages will show the owner of the associated actor
 * rather than the current user.
 * @return {void}
 */
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

/**
 * Configures whether initiative should be manually entered.
 * When enabled, allows users to manually input initiative values instead
 * of using automatic calculations.
 * @return {void}
 */
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

/**
 * Controls the visibility of status effect names.
 * When enabled, displays the names of status effects alongside their icons
 * in the interface.
 * @return {void}
 */
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

/**
 * Controls whether to show the welcome message on startup.
 * Users can disable the welcome message to prevent it from appearing
 * each time they start the system.
 * @return {void}
 */
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

/**
 * Controls the display of application window headers.
 * When enabled, shows only icons in application window headers
 * instead of both icons and text.
 * @return {void}
 */
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

/**
 * Sets whether to show a confirmation dialog before deleting actor items.
 * Helps prevent accidental deletion of items from actor sheets.
 * @return {void}
 */
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

/**
 * Configures the sound played for chat messages.
 * Allows users to set a custom notification sound for
 * when new chat messages are received.
 * @return {void}
 */
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

/**
 * Controls the visibility of profile images in chat messages.
 * When enabled, shows user/actor profile images alongside
 * their chat messages.
 * @return {void}
 */
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

/**
 * Controls whether chat descriptions are visible by default.
 * When enabled, automatically expands description sections in
 * chat messages instead of requiring manual expansion.
 * @return {void}
 */
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