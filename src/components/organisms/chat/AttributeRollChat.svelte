<script>
  import { onMount, getContext } from "svelte";
  import { SYSTEM_ID } from "~/src/helpers/constants";
  import ChatTitle from "~/src/components/molecules/chat/attributeRoll/ChatTitle.svelte";
  import Meteor from "~/src/components/atoms/meteor.svelte";

  export let FFMessage;
  export let content;
  export let enableToggle = true;

  let isContentVisible = game.settings.get(SYSTEM_ID, 'defaultChatDescriptionVisible');

  const message = getContext("message");
  
  $: showProfileImage = game.settings.get(SYSTEM_ID,'showChatProfileImages');
  $: title = FFMessage.flavor
  $: height = isContentVisible ? '1000px' : '0';
  $: style = `max-height: ${height}; overflow: hidden; transition: max-height 0.3s ease;`;

  onMount(async () => {
  });


  function toggleContent() {
    if (enableToggle) {
      isContentVisible = !isContentVisible;
    }
  }
</script>

<template lang="pug">
.flexcol.pointer
  .col(on:click="{toggleContent}" role="button")
    +if("FFMessage?.isCritical")
      ChatTitle(title="{title}" data="{FFMessage}" overlayValue="{$message?.rolls[0]?.total}" overlayColor="var(--off-white)" overlaySize="0.8rem")
        svelte:fragment(slot="rightImage")
          Meteor(size="28" fill="var(--ff-border-color)" innerFill="var(--message-color)" innerOpacity="1" opacity="1")

      +else
        ChatTitle(title="{title}" data="{FFMessage}" overlayValue="{$message?.rolls[0]?.total}" overlayColor="var(--off-white)" overlaySize="1rem" overlayMargin="0 0 0 0")
          div(slot="rightImage") {' '}
  .col.content(style="{style}") {@html content}
</template>

<style lang="sass">
  @use '../../../styles/_mixins' as mixins
</style> 