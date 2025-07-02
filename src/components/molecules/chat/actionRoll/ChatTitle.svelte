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
    console.log("handleTitleClick");
    dispatch("toggleDescription");
  };



  $: if ($message) {
    FFMessage = $message.getFlag(SYSTEM_ID, "data");
    if (FFMessage?.actor?._id) {
      actor = game.actors.get(FFMessage.actor._id);
    }
  }
  $: showProfileImage = game.settings.get(SYSTEM_ID, "showChatProfileImages");
  $: tagsColumnClass = item?.system?.tags?.length > 1 ? "flex4" : item?.system?.tags?.length > 0 ? "flex2" : "flex1";

  onMount(async () => {
    if (FFMessage?.item?.uuid) {
      item = await fromUuid(FFMessage.item.uuid);
    }
  });
</script>

<template lang="pug">
.chat-title
  +if("!FFMessage")
    .title.flex1 loading...
  +if("FFMessage")
    .title(class="{tagsColumnClass}" on:click="{handleTitleClick}" role="button" aria-label="Toggle description")
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
      .flexcol.no-overflow.names
        .col.actor-name.no-overflow.ellipsis(
          ) 
          a(
            on:click!="{openActorSheet}" 
            role="button"
            aria-label="Open {FFMessage.actor.name}'s character sheet"
            ) {FFMessage.actor.name}
        .col.font-cinzel.smaller.item-name.no-overflow.ellipsis(
        ) 
          a(
            on:click!="{(e) => openItemSheet(e, FFMessage.item.uuid)}"
            role="button"
            aria-label="Open {FFMessage.item.name} item sheet"
          ) {FFMessage.item.name}
      div
        .right.type-label.smaller.gold {FFMessage.item.type}
        +if("item?.system?.tags?.length > 0") 
          .right
            .flexrow.right.no-overflow(style="justify-content: flex-end; gap: 2px")
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
  .title
    display: grid
    gap: 0.2rem
    min-height: 40px
    color: white
  
    border-radius: var(--border-radius)
    position: relative
    padding: 0.1rem
    overflow: hidden
  
    +mixins.texture-texture($intensity: 0.05, $bgSize: 53%)
    +mixins.inset($padding: 0, $shadow: 0 -3px 20px rgba(0,0,0, 1) inset, $margin: 0 0 0 0, $border: 1px solid var(--ff-border-color), $border-radius: var(--border-radius))
    
    &.flex1
      grid-template-columns: minmax(40px, 1fr) 5fr minmax(50px, 1fr) minmax(40px, 1fr)
    &.flex2
      grid-template-columns: minmax(40px, 1fr) 5fr minmax(50px, 2fr) minmax(40px, 1fr)
    &.flex4
      grid-template-columns: minmax(40px, 1fr) 5fr minmax(50px, 4fr) minmax(40px, 1fr)

  .names
    align-self: center
  img
    background-color: var(--color-lowlight-dark)
    &.icon
      object-fit: cover
      object-position: center
</style>
