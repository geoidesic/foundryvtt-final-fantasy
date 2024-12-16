<script>
  import { onMount, getContext } from "svelte";
  import { SYSTEM_ID } from "~/src/helpers/constants";
  import ChatTitle from "~/src/components/molecules/chat/ChatTitle.svelte";
  import Meteor from "~/src/components/atoms/meteor.svelte";

  export let FFMessage;
  export let messageId;
  export let content;
  export let classes;
  export let FFMessageState;
  export let enableToggle = true;

  let isContentVisible = false;

  const message = getContext("message");
  
  $: showProfileImage = game.settings.get(SYSTEM_ID,'showChatProfileImages');
  $: title = FFMessage.flavor
  $: height = isContentVisible ? '1000px' : '0';
  $: style = `max-height: ${height}; overflow: hidden; transition: max-height 0.3s ease;`;

  onMount(async () => {
    game.system.log.g("AttributeRollChat mounted");
    game.system.log.g("FFMessage", FFMessage);
    game.system.log.g("message", $message);
  });


  function toggleContent() {
    if (enableToggle) {
      isContentVisible = !isContentVisible;
    }
  }
</script>

<template lang="pug">
.flexcol.pointer
  .col(on:click="{toggleContent}")
    ChatTitle(title="{title}" data="{FFMessage}" overlayValue="{$message.rolls[0].total}" overlayColor="var(--off-white)")
      svelte:fragment(slot="rightImage")
        Meteor(fill="var(--ff-border-color)" innerFill="var(--message-color)" innerOpacity="1" opacity="1")
  .col.content(style="{style}") {@html content}
</template>

<style lang="sass">
  @import '../../../styles/Mixins.sass'
  .img, img
    max-width: 35px
    max-height: 35px
</style> 