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

export default class RollCalc {

  message = {};
  constructor(params) {
    // game.system.log.d(params);
    this.params = params;
    this.store = writable({});
    this.subscribe = this.store.subscribe;
    this.set = this.store.set;
    this.update = this.store.update;
  }

  async send() {
    game.system.log.d('this.params', this.params)

    if (this.params.rollType) {
      game.system.log.d('this', this);
      game.system.log.d('this.params.rollType', this.params.rollType);

      let message = await this[this.params.rollType](this.params);
      // game.system.log.d('send message', message);
      if (message === false) return;
      message.sound = 'sounds/dice.wav';
      message.rollType = this.params.rollType;
      message.applied = false;
      message = Object.assign({}, this.message, message);
      await this.createChatMessage(message);
    }
  }

  async roll(die=4, noOfDice = 1, modifier = 0, keep = '') {
    let rollString = '';
    rollString = `max(${noOfDice}d${die}${keep}${modifier === 0 ? '' : modifier > 0 ? '+' + modifier : modifier},1)`;

    // roll the dice!
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

  playMessageSound(soundPath) {
    const customSound = game.settings.get(SYSTEM_ID, 'chatMessageSound').trim();
    if(!soundPath && customSound !== '') {
      soundPath = customSound;
    }
    game.system.log.d('playMessageSound', soundPath);
    if(soundPath) {
      AudioHelper.play({ src: soundPath, volume: 1, autoplay: true, loop: false });
    }
  }

  async createChatMessage(props) {
    game.system.log.d('createChatMessage props', props);

    const data = { ...props };

    // get item from props
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

    game.system.log.d('ChatMessage data', data);

    const message = await ChatMessage.create({
      user: game.user.id,
      flags: { [SYSTEM_ID]: { data } },
      // content: `Rolling 1d20+5: ${data.roll.result}`, // Customize the standard message content (text only)
      // rolls: [data.roll], //- makes it a standard roll chat
      // rollMode: "roll" //- makes it a public roll
    });
    // AudioHelper.play({ src: "sounds/dice.wav", volume: 0.8, autoplay: true, loop: false });
    this.playMessageSound();
    // AudioHelper.play({ src: "sounds/lock.wav", volume: 0.8, autoplay: true, loop: false });
    // AudioHelper.play({ src: "sounds/error.wav", volume: 0.8, autoplay: true, loop: false });

  }
}