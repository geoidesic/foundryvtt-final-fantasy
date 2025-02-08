/**
 * A helper to get a property from an object in a backwards-compatible way.
 *
 * - Foundry V12+ requires using foundry.utils.getProperty.
 * - Older versions need to fall back on globalThis.getProperty.
 *
 * This matches the version-checking logic used elsewhere in your module.
 */
export function getPropertyCompat(object, key) {
  // For example, if you already have a way of parsing or storing the version:
  const foundryVersion = (game?.version ?? game?.data?.version) || "0.0";
  const [majorVersion] = foundryVersion.split(".").map(v => parseInt(v, 10) || 0);

  // Use foundry.utils.getProperty if Foundry is at least version 12
  if (majorVersion >= 12 && foundry?.utils?.getProperty) {
    return foundry.utils.getProperty(object, key);
  }

  // Fallback for older Foundry
  return globalThis.getProperty(object, key);
} 