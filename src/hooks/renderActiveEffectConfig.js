import { SYSTEM_ID } from "~/src/helpers/constants"

/**
 * Add's the isOverlay checkbox to the active effect sheet
 * @deprecated this was a first attempt at a solution to the problem of overlay effects
 * Since then, there's now an ActiveEffect extension that handles this
 * @return {void}
 */
export default function renderActiveEffectConfig() {
  Hooks.on("renderActiveEffectConfig", (app, jq) => {
    const ae = app.document;
    jq.find("[name=statuses]")
      .closest(".form-group")
      .before(
        `<div class="form-group">
          <label>Is Overlay?</label>
          <input type=checkbox name="flags.${SYSTEM_ID}.overlay" ${ae.flags?.[SYSTEM_ID]?.overlay ? "checked" : ""}>
        </div>`
      );
    app.setPosition();
  });
}