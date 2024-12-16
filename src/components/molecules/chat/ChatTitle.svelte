<script>
  import { getContext, onMount } from "svelte";
  import { SYSTEM_ID } from "~/src/helpers/constants";

  export let data;
  export let overlayValue = '';
  export let overlayColor = 'black';

  const message = getContext("message");

  game.system.log.d("ChatTitle - message context:", message);
  game.system.log.d("ChatTitle - data prop:", data);
  
  $: showProfileImage = game.settings.get(SYSTEM_ID,'showChatProfileImages');
</script>

<template lang="pug">
.chat-title.flexrow.justify-vertical.mx-sm
  +if("showProfileImage")
    .portrait.left
      img.actor-img(src="{data.actor.img}" alt="{data.actor.name}")
  .flex4.title-block.font-cinzel
    .flavor {data.flavor}
  +if("showProfileImage")
    .portrait.right
      slot(name="rightImage")
        img.actor-img(src="{data.item?.img || data.actor.img}" alt="{data.item?.name || data.actor.name}")
      +if("overlayValue")
        .overlay(style="color: {overlayColor}") {overlayValue}
</template>

<style lang="sass">
.chat-title
  background-color: var(--message-color)
  color: var(--message-contrast)
  position: relative
  min-height: 35px
  margin: 1px 0 5px 0
  display: flex
  align-items: stretch
  

  .portrait
    flex: 0 0 35px
    width: 35px
    height: 35px
    display: flex
    align-items: center
    justify-content: center
    overflow: hidden
    background: rgba(0, 0, 0, 0.1)
    position: relative

    img
      max-width: 100%
      max-height: 100%
      width: auto
      height: auto
      object-fit: contain
      border-radius: 0

    &.left
      border-top-left-radius: var(--border-radius)
      border-bottom-left-radius: var(--border-radius)

    &.right
      border-top-right-radius: var(--border-radius)
      border-bottom-right-radius: var(--border-radius)

  .title-block
    display: flex
    align-items: center
    padding: 0 0.5rem
    flex: 1
    .flavor
      font-size: 0.9rem
      line-height: 1
      text-align: left

.overlay
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  font-size: 1.2rem
  font-weight: bold
  pointer-events: none
</style>