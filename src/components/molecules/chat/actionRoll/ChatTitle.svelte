<script>
  import { getContext, onMount, createEventDispatcher } from "svelte";
  import { SYSTEM_ID } from "~/src/helpers/constants";
  import Tag from "~/src/components/atoms/Tag.svelte";
  
  const dispatch = createEventDispatcher();
  const message = getContext("message");
  const FFMessage = $message.getFlag(SYSTEM_ID, 'data')
  const actor = game.actors.get(FFMessage.actor._id)
  let item = {}

  const openItemSheet = async (e, uuid) => {
    e.stopPropagation();
    item.sheet.render(true);
  }

  const openActorSheet = (e) => {
    e.stopPropagation();
    actor.sheet.render(true);
  }

  const handleTitleClick = () => {
    dispatch('toggleDescription');
  }

  onMount(async () => {
    item = await fromUuid(FFMessage.item.uuid)
  })

  $: showProfileImage = game.settings.get(SYSTEM_ID,'showChatProfileImages');

</script>

<template lang="pug">
.chat-title
  .flexrow.title(on:click="{handleTitleClick}" role="button")
    +if("showProfileImage")   
      img.icon.avatar(src="{FFMessage.actor.img}" alt="{FFMessage.actor.name}" on:click!="{openActorSheet}" role="button" aria-label="{FFMessage.actor.name}")
    .flex3.flexcol.nooverflow(class="{showProfileImage ? 'text' : ''}")
      .col 
        .flexrow
          .flex4.link.pointer(on:click!="{openActorSheet}" role="button" aria-label="{FFMessage.actor.name}") {FFMessage.actor.name}
      .col.font-cinzel.smaller.pointer.item-name.nooverflow(on:click!="{(e) => openItemSheet(e, FFMessage.item.uuid)}") {FFMessage.item.name}
    .flex3
      .flexcol
        .flex1.mr-xl-h.right.type-label.smaller.gold {FFMessage.item.type}
        +if("item?.system?.tags?.length > 0") 
          .flex3.right(style="margin-right: 2.2rem;")
            .flexrow.right(style="justify-content: flex-end; gap: 2px")
              +each("item?.system?.tags as tag")
                .flex0.right
                  Tag.badge.small.low({tag} remover="{false}")
    img.icon.right.item(src="{FFMessage.item.img}" alt="{FFMessage.item.name}")
</template>

<style lang="sass">
  @import '../../../../styles/Mixins.sass'
  .chat-title
    .item-name
      overflow: hidden
      text-overflow: ellipsis
      line-height: 1rem
      max-height: 1rem
      white-space: nowrap
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
      cursor: pointer
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
