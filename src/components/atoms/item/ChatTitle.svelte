<script>
  import { getContext, onMount } from "svelte";
  import { SYSTEM_ID } from "~/src/helpers/constants";
  
  const message = getContext("message");
  const FFMessage = $message.getFlag(SYSTEM_ID, 'data')
  const actor = game.actors.get(FFMessage.actor._id)
  console.log("FFMessage", FFMessage)
  const openItemSheet = async (uuid) => {
    console.log("uuid", uuid)
    const item = await fromUuid(uuid)
    console.log("item", item)
    item.sheet.render(true);
  }

  const openActorSheet = () => {
    actor.sheet.render(true);
  }

  $: showProfileImage = game.settings.get(SYSTEM_ID,'showChatProfileImages');

</script>

<template lang="pug">
.chat-title
  .flexrow.title
    +if("showProfileImage")   
      img.icon.avatar(src="{FFMessage.actor.img}" alt="{FFMessage.actor.name}")
    .flexcol(class="{showProfileImage ? 'text' : ''}")
      .col 
        .flexrow
          .flex4.link.pointer(on:click!="{openActorSheet}") {FFMessage.actor.name}
          .flex2.type-label.smaller.gold {FFMessage.item.type}
      .col.font-cinzel.smaller.pointer(on:click!="{() => openItemSheet(FFMessage.item.uuid)}") {FFMessage.item.name}
    img.icon.right.item(src="{FFMessage.item.img}" alt="{FFMessage.item.name}")
</template>

<style lang="sass">
  @import '../../../styles/Mixins.sass'
  .chat-title

    .type-label
      text-shadow: 0px 0px 5px rgba(255, 255, 255, 0.1)
      font-weight: 600
      font-family: "Cinzel", serif
    img
      &.icon
        flex: 0
        min-width: 30px
    +buttons
    .title
      border-radius: var(--border-radius)
      color: var(--message-contrast)
      position: relative
      padding: 0.2rem
      overflow: hidden
      .text
        margin-left: 40px
      
      +texture-background(var(--message-color), 0.1, 45%)
      
      .texture
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        z-index: 1
</style>
