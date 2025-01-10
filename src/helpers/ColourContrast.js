/**
 * Adjusts the alpha value of an RGBA color string
 * @param {string} rgba - The RGBA color string to adjust
 * @param {number} alpha - The new alpha value
 * @return {string} The adjusted RGBA color string
 */
export function adjustAlpha(rgba, alpha) {
  const [r, g, b] = rgba.match(/\d+/g);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Calculator for determining contrasting colors and color adjustments
 */
export default class ColourContrastCalculator {
  /**
   * Creates a new color contrast calculator
   * @param {string|Color} colour - The color to calculate contrast for
   * @param {object} options - Configuration options
   * @param {string} [options.calculationType="contrast"] - Type of calculation to perform
   * @param {string} [options.outputFormat="hex"] - Format for the output color
   */
  constructor(colour, { calculationType = "contrast", outputFormat = "hex" } = {}) {
    this.colour = colour;
    this.calculationType = calculationType;
    this.outputFormat = outputFormat;
  }

  hexToRgb(hex) {
    // Handle Color object from Foundry
    if (hex instanceof Color) {
      // Convert from 0-1 range to 0-255 range
      return [
        Math.round(hex.r * 255),
        Math.round(hex.g * 255),
        Math.round(hex.b * 255)
      ];
    }

    // Handle string hex values
    if (typeof hex === 'string') {
      // Remove the hash symbol and parse the hex values to integers
      hex = hex.replace(/^#/, '');
      const bigint = parseInt(hex, 16);
      
      // Extract RGB values using bitwise operations
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      
      return [r, g, b];
    }

    // If neither a Color object nor a string, return a default color
    console.warn('Invalid color format provided to hexToRgb:', hex);
    return [0, 0, 0];
  }

  rgbToHex(rgb) {
    // Convert RGB values to a hex string
    return `#${rgb.map(val => (val < 16 ? '0' : '') + val.toString(16)).join('')}`;
  }

  brightnessContrast(rgb) {
    // Calculate brightness as per W3C recommendation
    return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  }

  differenceContrast(rgb1, rgb2) {
    // Calculate color difference using Euclidean distance in RGB space
    return Math.sqrt(
      Math.pow(rgb1[0] - rgb2[0], 2) +
      Math.pow(rgb1[1] - rgb2[1], 2) +
      Math.pow(rgb1[2] - rgb2[2], 2)
    );
  }

  calculateHighestContrastColour() {
    const inputRgb = this.hexToRgb(this.colour);
    let highestContrastRgb;

    if (this.calculationType === "brightness") {
      // Adjust threshold from 0.5 to 0.7 to make more colors use dark text
      highestContrastRgb = this.brightnessContrast(inputRgb) >= 0.5 ? [40, 32, 26] : [255, 255, 255];
    } else if (this.calculationType === "difference") {
      // Calculate the highest contrast color based on difference
      highestContrastRgb = this.differenceContrast(inputRgb, [40, 32, 26]) >= this.differenceContrast(inputRgb, [255, 255, 255]) ? [40, 32, 26] : [255, 255, 255];
    } else if (this.calculationType === "contrast") {
      // Use same threshold as brightness for consistency
      highestContrastRgb = this.brightnessContrast(inputRgb) >= 0.5 ? [40, 32, 26] : [255, 255, 255];
    } else {
      throw new Error("Invalid calculationType");
    }

    return highestContrastRgb;
  }

  calculateContrast(alpha = 1.0) {
    const highestContrastRgb = this.calculateHighestContrastColour();

    if (this.outputFormat === "hex") {
      return this.rgbToHex(highestContrastRgb);
    } else if (this.outputFormat === "rgb") {
      return `rgb(${highestContrastRgb[0]}, ${highestContrastRgb[1]}, ${highestContrastRgb[2]})`;
    } else if (this.outputFormat === "rgba") {
      return `rgba(${highestContrastRgb[0]}, ${highestContrastRgb[1]}, ${highestContrastRgb[2]}, ${alpha})`;
    } else {
      throw new Error("Invalid outputFormat");
    }
  }

  /**
   * Get CSS variables for a color including contrast and RGB values
   * @returns {{color: string, contrast: string, rgb: string}} Object containing CSS-ready color values
   */
  getCSSVariables() {
    const rgbValues = this.hexToRgb(this.colour);
    return {
      color: this.colour instanceof Color ? this.colour.toString() : this.colour,
      contrast: this.calculateContrast(),
      rgb: rgbValues.join(', ')
    };
  }
}


