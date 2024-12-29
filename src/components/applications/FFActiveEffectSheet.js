import FFActiveEffectShell from './FFActiveEffectShell.svelte';
import { SvelteApplication } from "@typhonjs-fvtt/runtime/svelte/application";
import { SYSTEM_ID, SYSTEM_CODE } from "~/src/helpers/constants"

export default class FFActiveEffectSheet extends SvelteApplication {
   /**
    * Default Application options
    *
    * @returns {object} options - Application options.
    * @see https://foundryvtt.com/api/interfaces/client.ApplicationOptions.html
    */
   static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
         id: `${SYSTEM_ID}--active-effect-config`,
         classes: [SYSTEM_CODE, 'sheet', 'active-effect-config'],
         title: 'EFFECT.ConfigTitle',
         template: `systems/${SYSTEM_ID}/templates/active-effect-config.html`,
         width: 560,
         height: 'auto',
         tabs: [{navSelector: '.tabs', contentSelector: '.content', initial: 'details'}],
         dragDrop: [{dragSelector: null, dropSelector: null}],
         svelte: {
            class: FFActiveEffectShell,
            target: document.body
         }
      });
   }

   getData() {
      const effect = this.object;
      const data = {
         effect: effect,
         isActorEffect: effect.parent.documentName === 'Actor',
         isItemEffect: effect.parent.documentName === 'Item',
         submitText: 'EFFECT.Submit',
         modes: Object.entries(CONST.ACTIVE_EFFECT_MODES).reduce((obj, e) => {
            obj[e[1]] = game.i18n.localize('EFFECT.MODE_' + e[0]);
            return obj;
         }, {})
      };

      return data;
   }

   _updateObject(event, formData) {
      const effect = this.object;
      return effect.update(formData);
   }
}