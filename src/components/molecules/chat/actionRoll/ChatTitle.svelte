<script>
  import { getContext, onMount, createEventDispatcher } from "svelte";
  import { localize } from "~/src/helpers/util";
  import { SYSTEM_ID } from "~/src/helpers/constants";
  import Tag from "~/src/components/atoms/Tag.svelte";

  export let showDescription = false;

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
  $: tagsColumnClass = item?.system?.tags?.length > 1 ? "flex4" : item?.system?.tags?.length > 0 ? "flex2" : "flex1";
</script>

<template lang="pug">
.chat-title
  +if("FFMessage")
    .flexrow.title(on:click="{handleTitleClick}" role="button" aria-label="Toggle description")
      .texture
      +if("showProfileImage")   
        .flex1(
          role="button" 
          on:click="{openActorSheet}" 
          aria-label="Open {FFMessage.actor.name}'s character sheet"
        )
          img.icon.avatar(
            src="{FFMessage.actor.img}" 
            alt="{FFMessage.actor.name}"
          )
      .flex3.flexcol.no-overflow(class="{showProfileImage ? 'text' : ''}")
        .col 
          .flexrow
            .flex4.link.actor-name(
              on:click!="{openActorSheet}" 
              role="button"
              aria-label="Open {FFMessage.actor.name}'s character sheet"
            ) {FFMessage.actor.name}
        .col.font-cinzel.smaller.item-name.no-overflow(
          role="button"
          aria-label="Open {FFMessage.item.name} item sheet"
        ) 
          a(
            on:click!="{(e) => openItemSheet(e, FFMessage.item.uuid)}"
            role="button"
            aria-label="Open {FFMessage.item.name} item sheet"
          ) {FFMessage.item.name}
      div(class="{tagsColumnClass}")
        .flexcol
          .flex1.mr-xl-h.right.type-label.smaller.gold {FFMessage.item.type}
          +if("item?.system?.tags?.length > 0") 
            .flex3.right(style="margin-right: 2.2rem;")
              .flexrow.right(style="justify-content: flex-end; gap: 2px")
                +each("item?.system?.tags as tag")
                  .flex0.right
                    Tag.badge.smaller.round.low({tag} remover="{false}")
      //- using if / else here makes the tooltip work reactively, otherwise it doesn't update while it's being hovered over
      +if("showDescription")
        img.icon.right.item.pointer(
          src="{FFMessage.item.img}" alt="{FFMessage.item.name}"
          data-tooltip="{localize('Collapse')}"
        )
        +else
          img.icon.right.item.pointer(
            src="{FFMessage.item.img}" alt="{FFMessage.item.name}"
            data-tooltip="{localize('Expand')}"
          )
</template>

<style lang="sass">
@use '../../../../styles/_mixins' as mixins
.chat-title
  .actor-name
    &:hover
      text-decoration: underline
      cursor: pointer
  .item-name
    overflow: hidden
    text-overflow: ellipsis
    line-height: 1rem
    max-height: 1rem
    white-space: nowrap
    a
      &:hover
        text-decoration: underline
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
    
    +mixins.texture-texture($intensity: 0.05, $bgSize: 53%)
</style>
