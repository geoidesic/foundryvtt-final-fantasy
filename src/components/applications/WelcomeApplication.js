import WelcomeAppShell from './WelcomeAppShell.svelte';
import { SvelteApplication } from "#runtime/svelte/application";
import { version } from "~/system.json";
import { SYSTEM_ID, SYSTEM_CODE } from "~/src/helpers/constants"

/**
 * Welcome application that displays system information and welcome message
 * @extends {SvelteApplication}
 */
export default class WelcomeApplication extends SvelteApplication
{
   /**
    * Default Application options
    * @return {object} options - Application options.
    * @see https://foundryvtt.com/api/interfaces/client.ApplicationOptions.html
    */
   static get defaultOptions()
   {
      return foundry.utils.mergeObject(super.defaultOptions, {
         id: `${SYSTEM_ID}--welcome`,
         classes: [SYSTEM_CODE],
         resizable: true,
         minimizable: true,
         width: 600,
         height: 700,
         // headerIcon: 'systems/foundryvtt-final-fantasy/assets/critical.svg',
         title: game.i18n.localize(`${SYSTEM_CODE}.SystemName`)+' v'+version,
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