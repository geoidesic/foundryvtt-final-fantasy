<script>
  import { getContext, setContext, onDestroy, onMount } from "svelte";
  import { TJSDocument } from "#runtime/svelte/store/fvtt/document";

  import { getActorOwner } from "~/src/helpers/util";
  import * as ChatComponents from "~/src/components/organisms/chat";
  import ColourContrast from "~/src/helpers/ColourContrast";

  export let FFMessage;
  export let FFMessageState;
  export let messageId;
  
  let isReady = false;

  let actor = new TJSDocument(void 0, { delete: () => {} });
  let message = new TJSDocument(void 0);
  const sourceActor = game.actors.get(FFMessage.actor._id);
  const sourceMessage = game.messages.get(messageId);
  actor.set(sourceActor);
  message.set(sourceMessage);
  
  setContext("sourceActor", actor);
  setContext("message", message);
  
  let messageColor;
  let messageContrast;
  let messageColorRGB;
  
  onMount(() => {
    // game.system.log.i("race ---- START FFChat mount----");
    // game.system.log.b("race sourceActor", sourceActor)
    // game.system.log.b("race sourceMessage", sourceMessage)
    // game.system.log.b("race FFChat messageId", messageId)
    // game.system.log.b("race FFChat $message", $message)
    // game.system.log.b("race FFChat $actor", $actor)
    // game.system.log.b("race FFChat FFMessage", FFMessage)
    isReady = true;
  });

  $: if ($actor) {
    const ownerColor = getActorOwner($actor).color;
    const colorCalc = new ColourContrast(ownerColor);
    const cssVars = colorCalc.getCSSVariables();
    messageColor = cssVars.color;
    messageContrast = cssVars.contrast;
    messageColorRGB = cssVars.rgb;
  }

</script>

{#if isReady}
  <svelte:component
    this={ChatComponents[FFMessage.chatTemplate]}
    {...$$props}
    --message-color={messageColor}
    --message-contrast={messageContrast}
    --message-color-rgb={messageColorRGB}
  />
{/if}
