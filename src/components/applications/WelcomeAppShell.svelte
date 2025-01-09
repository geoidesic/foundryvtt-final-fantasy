<script>
  import { onMount, getContext } from "svelte";
  import { fade, scale }        from 'svelte/transition';
  import { ApplicationShell }   from '#runtime/svelte/component/core';
  import { localize } from "#runtime/util/i18n";
  import { SYSTEM_ID, SYSTEM_CODE } from "~/src/helpers/constants";
  import { gameSettings } from '~/src/config/gameSettings';

  export let elementRoot = void 0;
  // export let version = void 0;

  const application = getContext('#external').application;
  const dontShowWelcomeStore = gameSettings.getStore('dontShowWelcome');

  const handleChange = (event) => {
    game.settings.set(SYSTEM_ID, 'dontShowWelcome', event.target.checked);
  }


  let draggable = application.reactive.draggable;
  draggable = true

  $: application.reactive.draggable = draggable;
  $: dontShowWelcome = $dontShowWelcomeStore

  $: game.system.log.d('dontShowWelcome', dontShowWelcome);

  onMount(async () => {
  });
  
</script>

<svelte:options accessors={true}/>

<template lang="pug">
  ApplicationShell(bind:elementRoot)
    main
      .logo-background
        .texture
        img(src="systems/foundryvtt-final-fantasy/assets/FF-logo.png" alt="Final Fantasy XIV RPG Logo" style="border: none; width: auto;")
      p {localize('FF15.Welcome.To')} {localize(`${SYSTEM_CODE}.Title`)}!
      h1 {localize('FF15.Welcome.Introduction')}
      p  
        a(href="https://www.square-enix-shop.com/ffxivttrpg/en/freetrial.html") {localize(`${SYSTEM_CODE}.Title`)}
        | &nbsp;{localize(`${SYSTEM_CODE}.Welcome.Released`) }
      h1 Help
      p 
        span {localize('FF15.Welcome.Issues')}
        a(href="https://github.com/geoidesic/foundryvtt-final-fantasy/issues") {localize('FF15.Welcome.Github')}
      .flexrow.inset.justify-vertical(data-tooltip="{localize('FF15.Setting.DontShowWelcome.Hint')}")
        .flex0
          input(type="checkbox" on:change="{handleChange}" label="{localize('FF15.Setting.DontShowWelcome.Name')}" bind:checked="{dontShowWelcome}") 
        .flex
          span {localize('FF15.Setting.DontShowWelcome.Name')}
    footer
      .flex2.right
        img.pt-sm.white(src="systems/foundryvtt-final-fantasy/assets/round-table-games-logo.svg" alt="Round Table Games Logo" height="50" width="50" style="fill: white; border: none; width: auto;")
      .flex2.left.pt-sm
        h4 {localize(`${SYSTEM_CODE}.Title`)} {localize(`${SYSTEM_CODE}.Welcome.CreatedBy`)} 
        a(href="https://www.round-table.games") Round Table Games ©2024
</template>
<style lang="sass">
  @import "../../styles/Mixins.sass"
 
  main
    @include inset
    overflow-y: auto
    margin-bottom: 5em
    z-index: 1

    .logo-background
      +texture-background
        



  .white
    filter: invert(1)
    
  footer
    border-top: 8px ridge var(--border-shadow)
    display: grid
    grid-column-gap: 1rem
    grid-template-columns: 1fr 1.5fr
    position: fixed
    bottom: 0
    left: 0
    right: 0
    background-color: #333
    color: white
    text-align: center
    padding: 1em
    font-size: 0.8em
    z-index: 3
    img
      min-width: 70px
    a
      color: white
      text-decoration: underline
      &:hover
        color: #ccc
</style>
