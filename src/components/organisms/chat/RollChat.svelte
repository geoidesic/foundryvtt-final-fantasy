<script>
  import { onMount, getContext } from "svelte";
  import { activeEffectModes, SYSTEM_ID } from "~/src/helpers/constants";
  import { mappedGameTargets } from "~/src/stores";
  import { resolveDotpath } from "~/src/helpers/paths";
  import ChatTitle from "~/src/components/atoms/item/ChatTitle.svelte";

  // export let messageId;
  export let FFMessage;
  export let messageId;

  const message = getContext("message");

  async function applyToTarget() {
    game.system.log.d("applyToTarget");
    game.system.log.d("messageId", messageId);

    //- get item from message
    const item = FFMessage.item;
    const itemToUpdate = game.actors.get(FFMessage.actor._id).items.get(FFMessage.item._id);

    game.system.log.d("FFMessage", FFMessage);
    game.system.log.d("item", item);

    const itemQuantity = Number(itemToUpdate.system.quantity); // Get the current quantity of the item

    // Check if the item quantity is greater than 0
    if (itemQuantity <= 0) {
      // Show a notification and stop execution
      ui.notifications.error("The actor doesn't have sufficient quantity of this item to apply.");
      return; // Stop further execution
    }

    //- get effects from item
    const effects = item.effects;
    game.system.log.d("effects", effects);

    //- process effects; look through each effect's changes and collect those that are of mode `custom`
    const customChanges = [];
    const customMode = activeEffectModes.find((x) => x.label === "custom").value;
    game.system.log.d("customMode", customMode);
    for (const effect of effects) {
      const changes = effect.changes;
      for (const change of changes) {
        const mode = change.mode;
        game.system.log.d("mode", mode);
        if (mode === customMode) {
          customChanges.push(change);
        }
      }
    }

    game.system.log.d("customChanges", customChanges);

    //- for `custom` mode effects, Add the value directly to the target actors corresponding system value from the effect key and value
    for (const change of customChanges) {
      const key = change.key;
      const value = Number(change.value);

      for (const target of $mappedGameTargets) {
        const targetActor = fromUuidSync(target.actorUuid);
        const oldValue = Number(resolveDotpath(targetActor, key));
        game.system.log.d("oldValue", oldValue);
        let newValue = oldValue + value;
        game.system.log.d("proposed nuewValue", value);

        //- does the key contain `.val` at the end?
        const keyIsVal = key.endsWith(".val");
        //- if so, create two new keys, one with `.min` and one with `.max`
        if (keyIsVal) {
          const keyMin = key.replace(".val", ".min");
          const keyMax = key.replace(".val", ".max");
          const min = resolveDotpath(targetActor, keyMin);
          const max = resolveDotpath(targetActor, keyMax);
          game.system.log.d("min", min);
          game.system.log.d("max", max);
          //- if min is defined and newValue is less than min, set newValue to min
          if (min !== undefined && newValue < min) {
            game.system.log.d("min matched");
            newValue = min;
          }
          //- if max is defined and newValue is greater than max, set newValue to max
          if (max !== undefined && newValue > max) {
            game.system.log.d("max matched");
            newValue = max;
          }
        }

        game.system.log.d("value", value);
        game.system.log.d("newValue", newValue);
        game.system.log.d("before update", resolveDotpath(targetActor, key));
        await targetActor.update({ [key]: newValue });
        game.system.log.d("after update", resolveDotpath(targetActor, key));

        const actor = await fromUuid(target.actorUuid);
        game.system.log.d("actor var", resolveDotpath(actor, key));
      }
    }



    // Update the item's quantity in the actor's inventory
    await itemToUpdate.update({ "system.quantity": itemToUpdate.system.quantity - 1 });
    game.system.log.d("Updated item ", itemToUpdate);
    
    // await game.messages.get(messageId).update({ flags: { [SYSTEM_ID]: { data: {applied: true}  } } });
    await $message.update({ flags: { [SYSTEM_ID]: { data: {applied: true}  } } });
    game.system.log.d("message ", game.messages.get(messageId));

  }

  onMount(async () => {
    game.system.log.d("EquipmentChat mounted");
    game.system.log.d("FFMessage", FFMessage);
    // game.system.log.d(messageId);
  });

  $: hasTargets = $mappedGameTargets.size > 0;
  $: disabled = hasTargets ? false : true;
  $: buttonCss = disabled || applied ? "disabled" : "";
  $: applied = $message?.flags[SYSTEM_ID]?.data?.applied;
  $: showProfileImage = game.settings.get(SYSTEM_ID,'showChatProfileImages');

</script>

<template lang="pug">
.chat
  ChatTitle
  .flexrow
    .flex4#chat-description.inset {@html FFMessage.item.system.description} 
</template>

<style lang="sass">
  @import '../../../styles/Mixins.sass'
  .inset
    +inset
  :global(.FF15 #chat-description)
    background: url('/systems/foundryvtt-final-fantasy/assets/parchment4.webp')
    color: var(--color-text-dark)
    padding: 0.2rem 0.5rem
    margin-top: 0.2rem
  :global(.FF15 #chat-description p)
    font-size: 0.7rem
    line-height: 1.2rem
    font-family: "Trirong", serif
  .chat
    
      
</style>
