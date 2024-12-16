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

  const message = getContext("message");

  $: showProfileImage = game.settings.get(SYSTEM_ID,'showChatProfileImages');


  onMount(async () => {
    game.system.log.g("AttributeRollChat mounted");
    game.system.log.g("FFMessage", FFMessage);
    game.system.log.g("message", message);
  });
</script>

<template lang="pug">
.FF15
  .flexcol
    .col
      ChatTitle(data="{FFMessage}" overlayValue="42" overlayColor="red")
        svelte:fragment(slot="rightImage")
          Meteor(fill="var(--ff-border-color)" innerOpacity="0" opacity="1")
    .col.content {@html content}
</template>

<style lang="sass">
  @import '../../../styles/Mixins.sass'
  .img, img
    max-width: 35px
    max-height: 35px
</style> 