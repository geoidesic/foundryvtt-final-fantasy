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
    speaker: ChatMessage.getSpeaker({ actor: $actor }),
    flavor: `${attributeName} Check`,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    roll,
    flags: {
      [SYSTEM_ID]: {
        data: {
          chatTemplate: "RollChat",
          actor: {
            _id: $actor._id,
            name: $actor.name,
            img: $actor.img
          }
        }
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