<script>
  import { onMount, getContext } from "svelte";
  import { fade, scale }        from 'svelte/transition';
  import { ApplicationShell } from "#runtime/svelte/component/application";
  import { localize } from "~/src/helpers/util";
  import { SYSTEM_ID, SYSTEM_CODE } from "~/src/helpers/constants";
  import { gameSettings } from '~/src/config/gameSettings';

  export let elementRoot = void 0;
  export let version = void 0; //- avoid's build errors
  version; //- avoid's build errors

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
        img(src="/systems/foundryvtt-final-fantasy-XIV/assets/FF-logo.png" alt="Final Fantasy XIV RPG Logo" style="border: none; width: auto;")
      h1 {localize('Welcome.Introduction')}
      p.lightest 
        i.fa-solid.fa-info-circle.mr-sm
        a(href="https://www.square-enix-shop.com/ffxivttrpg/en/freetrial.html") {localize("Title")} 
        | {localize("Welcome.Released") }
        | {localize('Setting.DontShowWelcome.Introduction')}
      p.lighter
        i.fa-solid.fa-bug.mr-sm
        | {localize('Setting.DontShowWelcome.Bugs')} <a href="https://github.com/geoidesic/foundryvtt-final-fantasy-XIV/issues"> {localize('Setting.DontShowWelcome.IssuesLinkText')} </a>
      p 
        i.fa-solid.fa-heart.mr-sm(style="color: #660000;")
        | {localize('Setting.DontShowWelcome.Support')} <a href='https://github.com/sponsors/geoidesic'> {localize('Setting.DontShowWelcome.SponsorLinkText')} </a> or <a href='https://https://paypal.me/geoidesic'>PayPal</a>
      p.smallest
        | {localize('Welcome.Disclaimer')}
      //- h1 Help
      //- p
      //-   span {localize('Welcome.Issues')}
      //-   a(href="https://github.com/geoidesic/foundryvtt-final-fantasy-XIV/issues") {localize('Welcome.Github')}
      .flexrow.inset.justify-vertical.mb-sm.dont-show(data-tooltip="{localize('Setting.DontShowWelcome.Hint')}")
        .flex0
          input(type="checkbox" on:change="{handleChange}" label="{localize('Setting.DontShowWelcome.Name')}" bind:checked="{dontShowWelcome}") 
        .flex
          span {localize('Setting.DontShowWelcome.Name')}
    footer
      div.right.mr-md
        a(href="https://www.aardvark.games")
          img(src="/systems/foundryvtt-final-fantasy-XIV/assets/aardvark-logo.webp" alt="Aardvark Game Studios Logo" height="40" width="40" style="fill: white; border: none; width: auto;")
      div.left
        h4 {localize("Title")} 
        span {localize("Welcome.CreatedBy")} 
        //- a(href="https://www.round-table.games") Round Table Games
        a(href="https://www.aardvark.games") Aardvark Game Studios
    
</template>
<style lang="sass">
  @use '../../styles/_mixins' as mixins
 
  main

    +mixins.inset
    overflow-y: auto
    margin-bottom: 5em
    z-index: 1

    .logo-background
      +mixins.texture-background
      +mixins.texture-texture
        

  .dont-show
    font-size: smaller
    input
      cursor: pointer

  .white
    filter: invert(1)
    
  footer
    border-top: 8px ridge var(--border-shadow)
    display: grid
    grid-template-columns: 1fr 1.5fr
    position: fixed
    bottom: 0
    align-items: center
    line-height: 1em
    left: 0
    right: 0
    background-color: #333
    color: white
    text-align: center
    padding: 1em
    font-size: 0.8em
    z-index: 3
    a
      color: white
      text-decoration: underline
      &:hover
        color: #ccc
</style>
