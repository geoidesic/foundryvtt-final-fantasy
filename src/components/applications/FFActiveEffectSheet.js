import { SvelteApplication } from "#runtime/svelte/application";
import { TJSDocument } from "#runtime/svelte/store/fvtt/document";
import { generateRandomElementId } from "~/src/helpers/util";
import { SYSTEM_CODE, SYSTEM_ID } from "~/src/helpers/constants";
import FFActiveEffectShell from './FFActiveEffectShell.svelte';

export default class FFActiveEffectSheet extends SvelteApplication {
   #doc = new TJSDocument(void 0, { delete: this.close.bind(this) });
   #storeUnsubscribe;

   constructor(object) {
      super(object);
  
      // Define document store property
      Object.defineProperty(this.reactive, "document", {
        get: () => this.#doc.get(),
        set: (document) => {
          this.#doc.set(document);
        },
      });
      this.reactive.document = object;
  
      game.system.log.d('isEditing', this.reactive.document.system.isEditing);
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
         width: 594,
         height: 428,
         minHeight: 180,
         minWidth: 282,
         resizable: true,
         minimizable: true,
         classes: [SYSTEM_CODE, 'sheet', 'active-effect-config'],
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

   render(force = false, options = {}) {
      if (!this.#storeUnsubscribe) {
         this.#storeUnsubscribe = this.#doc.subscribe(this.#handleDocUpdate.bind(this));
      }
      return super.render(force, options);
   }

   async close(options = {}) {
      if (this.#storeUnsubscribe) {
         this.#storeUnsubscribe();
         this.#storeUnsubscribe = void 0;
      }
      return super.close(options);
   }

   #handleDocUpdate(doc) {
      if (doc) {
         this.reactive.title = `${game.i18n.localize("FF15.EFFECT.ConfigTitle")}: ${doc.name || ''}`;
      }
   }
}