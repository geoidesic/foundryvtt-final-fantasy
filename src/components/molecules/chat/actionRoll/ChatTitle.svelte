<script>
  import { getContext, onMount, createEventDispatcher } from "svelte";
  import { SYSTEM_ID } from "~/src/helpers/constants";
  import Tag from "~/src/components/atoms/Tag.svelte";

  const dispatch = createEventDispatcher();
  const message = getContext("message");
  let FFMessage;
  let actor;
  let item = {};

  $: if ($message) {
    FFMessage = $message.getFlag(SYSTEM_ID, "data");
    if (FFMessage?.actor?._id) {
      actor = game.actors.get(FFMessage.actor._id);
    }
  }

  const openItemSheet = async (e, uuid) => {
    e.stopPropagation();
    item.sheet.render(true);
  };

  const openActorSheet = (e) => {
    e.stopPropagation();
    actor.sheet.render(true);
  };

  const enterKey = (e) => {
    if (e.key === 'Enter') {
      openActorSheet(e);
    }
  };

  const handleTitleClick = () => {
    dispatch("toggleDescription");
  };

  onMount(async () => {
    if (FFMessage?.item?.uuid) {
      item = await fromUuid(FFMessage.item.uuid);
    }
  });

  $: showProfileImage = game.settings.get(SYSTEM_ID, "showChatProfileImages");
</script>

<template lang="pug">
.chat-title
  +if("FFMessage")
    .flexrow.title(on:click="{handleTitleClick}" role="button" aria-label="Toggle description")
      .texture
      +if("showProfileImage")   
        div(
          role="button" 
          on:click="{openActorSheet}" 
          aria-label="Open {FFMessage.actor.name}'s character sheet"
        )
          img.icon.avatar(
            src="{FFMessage.actor.img}" 
            alt="{FFMessage.actor.name}"
          )
      .flex3.flexcol.nooverflow(class="{showProfileImage ? 'text' : ''}")
        .col 
          .flexrow
            .flex4.link.pointer(
              on:click!="{openActorSheet}" 
              role="button"
              aria-label="Open {FFMessage.actor.name}'s character sheet"
            ) {FFMessage.actor.name}
        .col.font-cinzel.smaller.pointer.item-name.nooverflow(
          on:click!="{(e) => openItemSheet(e, FFMessage.item.uuid)}" 
          role="button"
          aria-label="Open {FFMessage.item.name} item sheet"
        ) {FFMessage.item.name}
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
@use '../../../../styles/_mixins' as mixins
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

  .title
    border-radius: var(--border-radius)
    color: var(--message-contrast)
    position: relative
    padding: 0.2rem
    overflow: hidden
    cursor: pointer
    .text
      margin-left: 40px
    
    +mixins.texture-background(var(--message-color))
    +mixins.texture-texture($intensity: 0.05, $bgSize: 53%)
</style>
