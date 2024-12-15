<script>
  import { onMount, getContext } from "svelte";
  import { SYSTEM_ID } from "~/src/helpers/constants";

  export let FFMessage;
  export let messageId;
  export let content;

  const message = getContext("message");

  onMount(async () => {
    game.system.log.d("RollChat mounted");
    game.system.log.d("FFMessage", FFMessage);
  });
</script>

<template lang="pug">
.FF15
  .flexrow
    .flex0.img.mr-xs
      img.actor-img(src="{FFMessage.actor.img}" alt="{FFMessage.actor.name}")
    .flex3.content {@html content}
</template>

<style lang="sass">
  @import '../../../styles/Mixins.sass'
  .img, img
    max-width: 100px

    max-height: 100px
</style> 