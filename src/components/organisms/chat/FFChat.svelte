<script>
  import { getContext, setContext, onDestroy, onMount } from "svelte";
  import { TJSDocument } from "@typhonjs-fvtt/runtime/svelte/store/fvtt/document";
  import { getActorOwner } from "~/src/helpers/util";
  import * as ChatComponents from "~/src/components/organisms/chat";
  import ColourContrast from "~/src/helpers/ColourContrast";

  // an object containing, specifically the data from the `surge` flag of the persisted chat message
  export let FFMessage;
  export let messageId;
  
  let actor = new TJSDocument(void 0, { delete: () => {} });
  let messageColor;
  let messageContrast;
  let foundryChatMessageDocument = (() => new TJSDocument(void 0, { delete: () => {} }))()

  $: if ($actor) {
    messageColor = getActorOwner($actor).color;
    messageContrast = new ColourContrast(messageColor).calculateContrast();
  }

  $: setContext("sourceActor", actor);

  onMount(async () => {
    game.system.log.d(FFMessage);
    game.system.log.d(FFMessage.chatTemplate);
    const sourceActor = await fromUuid(FFMessage.actorUuid);
    actor.set(sourceActor);
    await foundryChatMessageDocument.set(await game.messages.get(messageId));
  });

</script>

<svelte:component
  this={ChatComponents[FFMessage.chatTemplate]}
  {...$$props}
  foundryChatMessageDocument={foundryChatMessageDocument}
  --message-color={messageColor}
  --message-contrast={messageContrast}
/>
