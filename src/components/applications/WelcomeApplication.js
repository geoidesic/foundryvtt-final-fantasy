

import WelcomeAppShell from './WelcomeAppShell.svelte';
import { SvelteApplication } from "@typhonjs-fvtt/runtime/svelte/application";
import { version } from "~/system.json";

export default class WelcomeApplication extends SvelteApplication
{
   /**
    * Default Application options
    *
    * @returns {object} options - Application options.
    * @see https://foundryvtt.com/api/interfaces/client.ApplicationOptions.html
    */
   static get defaultOptions()
   {
      return foundry.utils.mergeObject(super.defaultOptions, {
        id: 'foundryvtt-actor-studio-welcome',
        classes: ['gas-actor-studio'],
         resizable: true,
         minimizable: true,
         width: 600,
         height: 600,
         // headerIcon: 'modules/foundryvtt-actor-studio/assets/actor-studio-logo-dragon-white.svg',
         title: game.i18n.localize('FF15.SystemName')+' v'+version,
         svelte: {
            class: WelcomeAppShell,
            target: document.body,
            intro: true,
            props: {
               version  // A prop passed to HelloFoundryAppShell for the initial message displayed.
            }
         }
      });
   }
}