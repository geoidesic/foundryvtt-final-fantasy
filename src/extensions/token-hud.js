
import { defaultStatusEffects } from "~/src/helpers/Conditions";
import { SYSTEM_ID, SYSTEM_CODE } from "~/src/helpers/constants";

export default class SurgeTokenHUD extends TokenHUD {
  constructor(...args) {
    super(...args);

    // Register a Handlebars helper function for hyrdation in the template
    Handlebars.registerHelper('showStatusEffectNames', function () {
      return game.settings.get(`${SYSTEM_ID}`, 'show-status-effect-names');
    });

    Handlebars.registerHelper('checkStatusAndEffect', function (title) {
      return title && game.settings.get(`${SYSTEM_ID}`, 'show-status-effect-names');
    });

    Handlebars.registerHelper('getDescription', function (status) {
      return defaultStatusEffects.find(i => i.id == [status.id])?.description || status.title
    });

    Handlebars.registerHelper('titleCssClass', function (cond) {
      return game.settings.get(`${SYSTEM_ID}`, 'show-status-effect-names') ? 'show-title' : 'hide-title';
    });
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: `systems/${SYSTEM_ID}/src/extensions/templates/token-hud.html`
    });
  }
}
