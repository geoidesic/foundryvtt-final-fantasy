<script>
  import { onMount, getContext, setContext } from "svelte";
  import { ApplicationShell } from '#runtime/svelte/component/core';
  import { localize } from "#runtime/svelte/helper";
  import { SYSTEM_ID } from "~/src/helpers/constants";
  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import Changes from "~/src/components/tabs/activeEffect/Changes.svelte";
  import Config from "~/src/components/tabs/activeEffect/Config.svelte";
  import PortraitFrame from "~/src/components/molecules/PortraitFrame.svelte";
  
  export let elementRoot = void 0;
  export let doc;

   const application = getContext('#external').application;
  // setContext("#doc", application.reactive.document);
  setContext("#doc", doc);
  
  let activeTab = "config";
  
  const tabs = [
    { 
      label: localize('EFFECT.Config'), 
      id: "config", 
      component: Config,
      img: '/systems/foundryvtt-final-fantasy/assets/icons/tabs/cog.webp'
    },
    { 
      label: localize('EFFECT.Changes'), 
      id: "changes", 
      component: Changes,
      img: '/systems/foundryvtt-final-fantasy/assets/icons/tabs/list.webp'
    },
  ];

  onMount(() => {
    // Any initialization if needed
    game.system.log.g('FFActiveEffectShell doc', doc);
    game.system.log.g('FFActiveEffectShell $doc', $doc);
    game.system.log.g('FFActiveEffectShell application', application);
  });
</script>

<svelte:options accessors={true}/>

<template lang="pug">
   ApplicationShell(bind:elementRoot)
    .flexrow.gap-15.wide.high.nooverflow.nowrap
      .flex4.wide.mr-sm.high
        section.mt-sm.high
          .flex1.portrait-frame
            PortraitFrame.high.frame.wide
              Tabs.tabs.small.wide( {tabs} bind:activeTab="{activeTab}")
</template>

<style lang="sass">
  @import '../../styles/Mixins.sass'

  .profile-wrap
    min-width: 50px
    max-width: 150px
  .portrait-frame 
    margin-right: -2px
    z-index: 2
    height: calc(100% - 10px)
</style>
