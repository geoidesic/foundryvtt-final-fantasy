import { SYSTEM_ID } from "~/src/helpers/constants"

/**
 * Hook that runs when the active effect config is rendered
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