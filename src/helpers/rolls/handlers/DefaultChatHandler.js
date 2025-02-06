import { SYSTEM_ID } from "~/src/helpers/constants.js";

/**
 * Handles all action-related operations
*/
export default class DefaultChatHandler {
  /**
   * @param {Actor} actor - The actor this handler is for
   */
  constructor(actor) {
    this.actor = actor;
  }

  /**
   * Handles the default chat message for an item
   * @param {Item} item - The item to create a chat message for
   * @return {Promise<ChatMessage>} The created chat message
   */
  async handle(item) {
    setTimeout(async () => {
      return await ChatMessage.create({
        user: game.user.id,
        speaker: game.settings.get(SYSTEM_ID, 'chatMessageSenderIsActorOwner')
          ? ChatMessage.getSpeaker({ actor })
          : null,
        flags: {
          [SYSTEM_ID]: {
            data: {
              chatTemplate: 'RollChat',
              actor: {
                _id: actor._id,
                name: actor.name,
                img: actor.img
              },
              item: {
                _id: item._id,
                uuid: item.uuid,
                name: item.name,
                img: item.img,
                type: item.type,
                system: item.system
              }
            }
          }
        }
      });
    }, 2000);
  }
}
