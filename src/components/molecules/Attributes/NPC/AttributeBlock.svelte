<script>
  import { onMount, getContext } from "svelte";
  import { getSizeOptions } from "~/src/helpers/constants";
  import { SYSTEM_ID } from "~/src/helpers/constants";
  import PrimaryAttributes from "~/src/components/molecules/Attributes/NPC/PrimaryAttributes.svelte";
  import SecondaryAttributes from "~/src/components/molecules/Attributes/NPC/SecondaryAttributes.svelte";
  import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";

  const sizeOptions = getSizeOptions();

  const actor = getContext("#doc");

  // Add size-to-grid mapping
  const sizeToGrid = {
    tiny: 0.5,
    small: 1,
    medium: 1,
    large: 2,
    huge: 3,
    gargantuan: 4
  };

  // Handle size changes
  const onSizeChange = async (newSize) => {
    const gridSize = sizeToGrid[newSize.toLowerCase()] || 1;
    
    // Update the prototype token dimensions
    await $actor.update({
      "prototypeToken.width": gridSize,
      "prototypeToken.height": gridSize
    });
  };

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
            chatTemplate: "AttributeRollChat",
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

<template lang="pug">
.molecule
  .flexrow.sheet-row.justify-vertical
    .flex1.ml-md.mt-md.left.white
      label Size
    .flex1.mt-md.mr-md.right
      DocSelect.right.white(
        name="size" 
        valuePath="system.size" 
        options="{sizeOptions}"
        callback="{onSizeChange}"
      )
  .flexrow

    .flex
      PrimaryAttributes(onclick="{onclick}")
    .flex
      SecondaryAttributes(onclick="{onclick}")

</template>

<style lang="sass">
  @import '../../../../styles/Mixins.sass'

  .molecule
    height: 100%
    width: 100%
    white-space: nowrap
</style>
