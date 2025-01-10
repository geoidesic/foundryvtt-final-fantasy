import { writable, get } from 'svelte/store';
import { SYSTEM_ID } from '~/src/helpers/constants';

/**
 * Possible Values for rollMode:
 * rollMode: "roll" (Public Roll):
 * The message or roll result is visible to everyone in the game.
 * rollMode: "gmroll" (GM Roll):
 * The roll result is only visible to the GM and the player who made the roll.
 * rollMode: "blindroll" (Blind Roll):
 * The roll result is only visible to the GM. The player who made the roll and other players do not see the result.
 * rollMode: "selfroll" (Self Roll):
 * The roll result is only visible to the player who made the roll. The GM and other players do not see the result.
 * rollMode: "private" (Private Roll):
 * Deprecated in later versions of Foundry VTT, this mode used to represent a private roll visible only to the GM.
 */

/**
 * Class to handle roll calculations and modifiers
 */
export default class RollCalc {
  /**
   * Creates a new RollCalc instance
   * @param {object} params - The parameters for the roll calculation
   */
  constructor(params) {
    this.params = params;
    this.store = writable({});
    this.subscribe = this.store.subscribe;
    this.set = this.store.set;
    this.update = this.store.update;
    this.RG = new CONFIG.FF15.RollGuards(this.params.actor);
  }

  /**
   * Send the roll to chat
   * @return {Promise<void>}
   */
  async send() {
    if (this.params.rollType) {
      let message = await this[this.params.rollType](this.params);
      if (message === false) return;
      message.sound = 'sounds/dice.wav';
      message.rollType = this.params.rollType;
      message.applied = false;
      message = Object.assign({}, this.message, message);
      await this.createChatMessage(message);
    }
  }

  /**
   * Perform a dice roll
   * @param {number} die - The die size
   * @param {number} noOfDice - Number of dice to roll
   * @param {number} modifier - Roll modifier
   * @param {string} keep - Keep modifier
   * @return {Promise<object>} The roll result
   */
  async roll(die=4, noOfDice = 1, modifier = 0, keep = '') {
    let rollString = `max(${noOfDice}d${die}${keep}${modifier === 0 ? '' : modifier > 0 ? '+' + modifier : modifier},1)`;
    const roll = new Roll(rollString);

    if (game.version < 12) {
      await roll.roll({ async: true });
    } else {
      await roll.roll();
    }

    if (game.modules.get('dice-so-nice')?.active) {
      await game.dice3d.showForRoll(roll);
    }
    return { roll, die, noOfDice, error: false };
  }

  /**
   * Play a sound for the message
   * @param {string} soundPath - Path to the sound file
   */
  playMessageSound(soundPath) {
    const customSound = game.settings.get(SYSTEM_ID, 'chatMessageSound').trim();
    if(!soundPath && customSound !== '') {
      soundPath = customSound;
    }
    if(soundPath) {
      foundry.audio.AudioHelper.play({ src: soundPath, volume: 1, autoplay: true, loop: false });
    }
  }

  /**
   * Create a chat message for the roll
   * @param {object} props - The message properties
   * @return {Promise<void>}
   */
  async createChatMessage(props) {
    const data = { ...props };
    let item, actor;
    
    try {
      item = props.Item ? props.Item : fromUuidSync(props.itemUuid);
    } catch (error) {
      ui.notifications.error('Item cannot be used from a compendium Actor.');
      console.error(error);
      return;
    }
    
    try {
      actor = fromUuidSync(props.actorUuid);
    } catch (error) {
      ui.notifications.error(error);
      throw error;
    }

    await ChatMessage.create({
      user: game.user.id,
      flags: { [SYSTEM_ID]: { data } },
      speaker: game.settings.get(SYSTEM_ID,'chatMessageSenderIsActorOwner') ? ChatMessage.getSpeaker({ actor: actor }) : null,
    });
    
    this.playMessageSound();
  }
}