<script>
import { onMount, getContext } from 'svelte';
import { SYSTEM_ID } from "~/src/helpers/constants";
import PrimaryAttributes from "~/src/components/molecules/Attributes/PrimaryAttributes.svelte";
import SecondaryAttributes from "~/src/components/molecules/Attributes/SecondaryAttributes.svelte";

const actor = getContext("#doc");

const onclick = async (key, code) => {
  game.system.log.d('actor', $actor);
  const attributeValue = $actor.system.attributes[key][code].val;
  const rollFormula = `1d20 + ${attributeValue}`;
  const attributeName = code.toUpperCase();
  
  const roll = await new Roll(rollFormula).evaluate({async: true});
  
  const messageData = {
    speaker: game.settings.get(SYSTEM_ID,'chatMessageSenderIsActorOwner') ? ChatMessage.getSpeaker({ actor: $actor }) : null,
    // speaker: ChatMessage.getSpeaker({ actor: $actor }), //- this sets the speaker to the actor owner, without it, it will be the user that triggered the action
    flavor: `${attributeName} Check`,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    roll,
    flags: {
      [SYSTEM_ID]: {
        data: {
          chatTemplate: "AttributeRollChat",
          actor: {
            _id: $actor._id,
            name: $actor.name,
            img: $actor.img
          }
        },
        css: 'attribute-roll'
      }
    }
  };
  
  await roll.toMessage(messageData);
}

</script>
<template lang='pug'>
  .molecule.flexrow
    .flex
      PrimaryAttributes(onclick="{onclick}")
    .flex
      SecondaryAttributes(onclick="{onclick}")
    
</template>
<style lang='sass'>
  @import '../../../styles/Mixins.sass'

  .molecule
    height: 100%
    width: 100%
    white-space: nowrap
</style>