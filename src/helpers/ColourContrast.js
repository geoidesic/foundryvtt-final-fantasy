export function adjustAlpha(rgba, alpha) {
  const [r, g, b, _] = rgba.match(/\d+/g);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default class ColourContrastCalculator {
  constructor(colour, { calculationType = "contrast", outputFormat = "hex" } = {}) {
    this.colour = colour;
    this.calculationType = calculationType;
    this.outputFormat = outputFormat;
  }

  hexToRgb(hex) {
    // Remove the hash symbol and parse the hex values to integers
    hex = hex.replace(/^#/, '');
    const bigint = parseInt(hex, 16);

    // Extract RGB values using bitwise operations
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r, g, b];
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
    const inputRgb = this.colour instanceof Color ? this.hexToRgb(this.colour.toString()) : this.hexToRgb(this.colour);
    let highestContrastRgb;

    if (this.calculationType === "brightness") {
      // Calculate the highest contrast color based on brightness
      highestContrastRgb = this.brightnessContrast(inputRgb) >= 0.5 ? [64, 51, 40] : [255, 255, 255];
    } else if (this.calculationType === "difference") {
      // Calculate the highest contrast color based on difference
      highestContrastRgb = this.differenceContrast(inputRgb, [64, 51, 40]) >= this.differenceContrast(inputRgb, [255, 255, 255]) ? [64, 51, 40] : [255, 255, 255];
    } else if (this.calculationType === "contrast") {
      // Calculate the highest contrast color based on contrast
      highestContrastRgb = this.brightnessContrast(inputRgb) >= 0.5 ? [64, 51, 40] : [255, 255, 255];
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

  adjustAlpha
}


