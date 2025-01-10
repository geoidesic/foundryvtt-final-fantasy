import { getDefaultStatusEffects } from "~/src/helpers/Conditions";
import { SYSTEM_ID } from "~/src/helpers/constants";

/**
 * Extends the TokenHUD class to implement system-specific token HUD functionality
 * @extends {TokenHUD}
 */
export default class FFTokenHUD extends TokenHUD {
  /** @type {Array} The default status effects for tokens */
  defaultStatusEffects;

  /**
   * Initialize the token HUD
   * @param {...any} args - Arguments passed to the constructor
   */
  constructor(...args) {
    super(...args);

    if(typeof this.defaultStatusEffects === 'undefined') {
      console.log('defaultStatusEffects not found, getting default status effects');
      this.defaultStatusEffects = getDefaultStatusEffects();
    }

    const that = this
    // Register a Handlebars helper function for hyrdation in the template
    Handlebars.registerHelper('showStatusEffectNames', function () {
      return game.settings.get(`${SYSTEM_ID}`, 'show-status-effect-names');
    });

    Handlebars.registerHelper('checkStatusAndEffect', function (title) {
      return title && game.settings.get(`${SYSTEM_ID}`, 'show-status-effect-names');
    });

    Handlebars.registerHelper('getDescription', function (status) {
      return that.defaultStatusEffects.find(i => i.id == [status.id])?.description || status.title
    });

    Handlebars.registerHelper('titleCssClass', function (cond) {
      return game.settings.get(`${SYSTEM_ID}`, 'show-status-effect-names') ? 'show-title' : 'hide-title';
    });
  }

  /**
   * Get the default options for the token HUD
   * @return {object} The default options
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: `systems/${SYSTEM_ID}/src/extensions/templates/token-hud.html`
    });
  }
}
