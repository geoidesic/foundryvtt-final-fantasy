import SvelteDocumentSheet from "~/src/documents/DocumentSheet";
import ItemSheetShell from "./ItemSheetShell.svelte";
import { SYSTEM_CODE, SYSTEM_ID } from "~/src/helpers/constants";
import { SvelteApplication } from "@typhonjs-fvtt/runtime/svelte/application";

export default class FF15ItemSheet extends SvelteDocumentSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${SYSTEM_ID}--item-sheet`,
      classes: [SYSTEM_CODE],
      title: game.i18n.localize(`${SYSTEM_CODE}.Types.Item`),
      width: 550,
      height: 400,
      minWidth: 400,
      svelte: {
        class: ItemSheetShell,
        target: document.body,
      },
    });
  }
}

