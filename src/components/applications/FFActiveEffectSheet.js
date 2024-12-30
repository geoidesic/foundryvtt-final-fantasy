import { SvelteApplication } from "#runtime/svelte/application";
import { TJSDocument } from '#runtime/svelte/store/fvtt/document';
import { generateRandomElementId } from "~/src/helpers/util";
import { SYSTEM_CODE, SYSTEM_ID } from "~/src/helpers/constants";
import FFActiveEffectShell from './FFActiveEffectShell.svelte';

export default class FFActiveEffectSheet extends SvelteApplication {
   #doc;

   constructor(doc, options) {
      super(options);
      this.#doc = new TJSDocument(doc, { delete: () => this.close() });
   }

   /**
    * Default Application options
    *
    * @returns {object} options - Application options.
    * @see https://foundryvtt.com/api/interfaces/client.ApplicationOptions.html
    */
   static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
         id: `${SYSTEM_ID}--active-effect-sheet-${generateRandomElementId()}`,
         classes: [SYSTEM_CODE, 'sheet', 'active-effect-config'],
         title: 'EFFECT.ConfigTitle',
         width: 560,
         height: 'auto',
         svelte: {
            class: FFActiveEffectShell,
            target: document.body,
            props: {
               doc: null
            }
         }
      });
   }

   /** @override */
   get document() {
      return this.#doc;
   }

   /** @override */
   async _injectHTML(html) {
      this.options.svelte.props.doc = this.document;
      return super._injectHTML(html);
   }
}