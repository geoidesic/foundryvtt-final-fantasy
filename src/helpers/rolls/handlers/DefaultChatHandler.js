import { SYSTEM_ID } from "~/src/helpers/constants.js";

/**
 * Creates a default chat message for a given actor and item.
 * @param {Actor} actor - The actor creating the chat message.
 * @param {Item} item - The item to be displayed in the chat message.
 * @return {Promise<ChatMessage>} The created chat message.
 */
export async function createDefaultChat(actor, item) {
  return ChatMessage.create({
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
} 