<script>
  import { onMount, getContext } from "svelte";
  import { activeEffectModes, SYSTEM_ID } from "~/src/helpers/constants";
  import { mappedGameTargets } from "~/src/stores";
  import { resolveDotpath } from "~/src/helpers/paths";

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

</script>

<template lang="pug">
.FF15
  .chat.pa-xs
    .flexrow.justify-vertical.title
      .texture
      img.icon(src="{FFMessage.actor.img}" alt="{FFMessage.actor.name}")
      .flex4 {FFMessage.actor.name}
      .flex3.right {FFMessage.item.name}
      img.icon.right(src="{FFMessage.item.img}" alt="{FFMessage.item.name}")
    .flexrow.justify-vertical.mt-sm
      .flex4.buttons
        button.short.wide.stealth.rowimgbezelbutton.flexrow(class="{buttonCss}" on:click="{applyToTarget}") 
          .flex3.pa-sm {window.game.i18n.format(`FF15.Chat.Buttons.${applied ? 'AppliedTo' : 'ApplyItemToTarget'}`, [FFMessage.item.name, FFMessage.actor.name])}
          .flex0
            i.fa.fa-crosshairs.mr-sm.right.mt-sm

</template>

<style lang="sass">
  @import '../../../styles/Mixins.sass'

  .chat
    +buttons
    .title
      border-radius: var(--border-radius)
      color: white
      
      +texture-background(rgba(144, 29, 20, 0.7), 0.1, 80%)
</style>
