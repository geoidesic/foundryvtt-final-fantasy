<script>
  import { getContext, setContext, onDestroy, onMount } from "svelte";
  import { TJSDocument } from "@typhonjs-fvtt/runtime/svelte/store/fvtt/document";
  import { getActorOwner } from "~/src/helpers/util";
  import * as ChatComponents from "~/src/components/organisms/chat";
  import ColourContrast from "~/src/helpers/ColourContrast";

  export let FFMessage;
  export let FFMessageState;
  export let messageId;
  
  let isReady = false;
  let actor = new TJSDocument(void 0, { delete: () => {} });
  let message = new TJSDocument(void 0);
  let messageColor;
  let messageContrast;

  onMount(async () => {
    game.system.log.i("race ---- START FFChat mount----");
    const sourceActor = game.actors.get(FFMessage.actor._id);
    actor.set(sourceActor);
    message.set(game.messages.get(messageId));
    game.system.log.d("race FFChat messageId", messageId)
    game.system.log.d("race FFChat message", message)
    isReady = true;
  });

  $: if ($actor) {
    messageColor = getActorOwner($actor).color;
    messageContrast = new ColourContrast(messageColor).calculateContrast();
  }

  $: setContext("sourceActor", actor);
  $: setContext("message", message);
</script>

{#if isReady}
  <svelte:component
    this={ChatComponents[FFMessage.chatTemplate]}
    {...$$props}
    --message-color={messageColor}
    --message-contrast={messageContrast}
  />
{/if}
