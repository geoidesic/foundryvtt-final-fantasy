import { TJSGameSettings } from '#runtime/svelte/store/fvtt/settings';
import { SYSTEM_ID }       from '~/src/helpers/constants';

/**
 * Provides a shared instance of TJSGameSettings across the system
 * @type {TJSGameSettings}
 */
export const gameSettings = new TJSGameSettings(SYSTEM_ID);
