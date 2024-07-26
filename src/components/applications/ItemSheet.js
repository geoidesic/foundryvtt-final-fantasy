import SvelteDocumentSheet from "~/documents/DocumentSheet";
import ItemSheetShell from "./ItemSheetShell.svelte";

export default class FF15ItemSheet extends SvelteDocumentSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 500,
      height: 500,
      minWidth: 400,
      svelte: {
        class: ItemSheetShell,
        target: document.body,
      },
    });
  }
}

