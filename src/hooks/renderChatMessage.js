import ColourContrast from "~/src/helpers/ColourContrast";
import FFChat from "~/src/components/organisms/chat/FFChat.svelte";

import { getActorOwner } from "~/src/helpers/util";
import { SYSTEM_ID, SYSTEM_CODE } from "~/src/helpers/constants";
/**
 * Used by chat message demo to manually attach a Svelte component, SurgeRoll, to a chat message.
 *
 * Note: You must manually destroy this Svelte component in an associated `preDeleteChatMessage` like the one provided
 * below. The reason being is that you are manually / conditionally creating a Svelte component that is not monitored /
 * controlled by TRL itself, so you must also manually destroy this component when the chat message is deleted.
 */
export default function renderChatMessage() {

  Hooks.on('renderChatMessage', (message, html) => {

    const FFMessage = message.getFlag(SYSTEM_ID, 'data');
    const FFMessageState = message.getFlag(SYSTEM_ID, 'state');

    // game.system.log.p(">>>>>> race renderChatMessage HOOK TRIGGERED <<<<<<", {
    //   messageId: message.id,
    //   hasFFMessage: !!FFMessage,
    //   flags: message.flags[SYSTEM_ID]
    // });

    // Add texture div to message header if it exists
    const messageHeader = html.find('.message-header');
    if (messageHeader.length) {
      messageHeader.prepend('<div class="texture"></div>');
    }

    if (message.flags[SYSTEM_ID]?.css) {
      html.addClass(message.flags[SYSTEM_ID].css);
    }

    if (typeof FFMessage === 'object') {
      const originalContent = html[0].innerHTML;

      // Create tempDiv for all message types
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = originalContent;

      // Apply color variables to header for all message types
      const header = tempDiv.querySelector('.message-header');
      if (header) {
        // Get actor color variables
        const sourceActor = game.actors.get(FFMessage.actor._id);
        const ownerColor = getActorOwner(sourceActor).color;
        const colorCalc = new ColourContrast(ownerColor);
        const cssVars = colorCalc.getCSSVariables();

        // Apply color variables to header
        header.style.setProperty('--message-color', cssVars.color);
        header.style.setProperty('--message-contrast', cssVars.contrast);
        header.style.setProperty('--message-color-rgb', cssVars.rgb);
      }

      let content;

      // For Attribute and Action rolls, extract just the message content
      if (['AttributeRollChat', 'ActionRollChat'].includes(FFMessage.chatTemplate)) {
        // Extract the message content and flavor text
        const messageContent = tempDiv.querySelector('.message-content');
        const flavorText = tempDiv.querySelector('.flavor-text');
        const contentToPass = `
        ${flavorText ? `<span class="flavor-text">${flavorText.innerHTML}</span>` : ''}
        ${messageContent ? messageContent.innerHTML : ''}
      `;
        // Remove flavor text from header and update HTML
        if (header) {
          const headerFlavorText = header.querySelector('.flavor-text');
          if (headerFlavorText) {
            headerFlavorText.remove();
          }
          html[0].innerHTML = header.outerHTML;
        }
        content = contentToPass;
      } else {
        // For other message types, update header colors but keep original content
        if (header) {
          const originalHeader = html[0].querySelector('.message-header');
          if (originalHeader) {
            originalHeader.outerHTML = header.outerHTML;
          }
        }
        content = originalContent;
      }
      html.addClass(SYSTEM_CODE);
      html.addClass('leather');

      message._svelteComponent = new FFChat({
        target: html[0],
        props: {
          classes: 'leather',
          FFMessage,
          FFMessageState,
          messageId: message._id,
          content
        }
      });
    }
  });
} 