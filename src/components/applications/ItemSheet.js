import SvelteDocumentSheet from "~/src/documents/DocumentSheet";
import ItemSheetShell from "./ItemSheetShell.svelte";
import { SYSTEM_CODE, SYSTEM_ID } from "~/src/helpers/constants";
import { generateRandomElementId } from "~/src/helpers/util";

/**
 * Base class for FF15 item sheets
 * @extends {SvelteDocumentSheet}
 */
export default class FF15ItemSheet extends SvelteDocumentSheet {

  /**
   * Default Application options
   * @return {object} The default options for this application
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${SYSTEM_ID}--item-sheet-${generateRandomElementId()}`,
      classes: [SYSTEM_CODE],
      title: game.i18n.localize(`${SYSTEM_CODE}.Types.Item.Label`),
      width: 550,
      height: 500,
      minHeight: 180,
      minWidth: 400,
      svelte: {
        class: ItemSheetShell,
        target: document.body,
      },
    });
  }

}

