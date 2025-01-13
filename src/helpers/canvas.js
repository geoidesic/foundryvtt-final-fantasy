/**
 * Creates a scrolling text effect above a token showing damage or healing
 * @param {Token} token - The token to show text above
 * @param {number} amount - The amount of damage/healing to display
 * @param {boolean} isHealing - Whether this is healing (green) or damage (red)
 */
export function createDamageText(token, amount, isHealing = false) {
  const displayValue = `${isHealing ? '+' : '-'}${Math.abs(amount)}`;
  canvas.interface.createScrollingText(
    token.center,
    displayValue,
    {
      anchor: CONST.TEXT_ANCHOR_POINTS.TOP,
      direction: CONST.TEXT_ANCHOR_POINTS.TOP,
      duration: 1000,
      distance: 100,
      fontSize: 36,
      fill: isHealing ? "#00ff00" : "#ff0000",
      stroke: "#000",
      strokeThickness: 4
    }
  );
} 