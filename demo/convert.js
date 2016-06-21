var parseUnit = require('parse-unit');
var defined = require('defined');

// Most browsers have a default font size of 16px
var DEFAULT_PX_SIZE = 16;

// Returns a pixel font size from a Opentype.js font and number / CSS string:
// Supported values: '1em', '24px', '32pt'
// Numbers and unit-less values are assumed to already be in pixels
module.exports.getFontSizePx = function (font, value, dpi) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') throw new TypeError('Expected number or string for getFontPixelSize');
  const parsed = parseUnit(value);
  if (!parsed[1] || parsed[1] === 'px') {
    return parsed[0];
  }

  if (parsed[1] === 'em') {
    return parsed[0] * DEFAULT_PX_SIZE;
  } else if (parsed[1] === 'pt') {
    dpi = defined(dpi, 96);
    return parsed[0] * dpi / 72;
  } else {
    throw new TypeError('Unsupported unit for fontSize: ' + parsed[1]);
  }
};

// Returns actual EM units for the given value, e.g. 1em => 2048 units
module.exports.getEmUnits = function (font, fontSizePx, value) {
  var parsed = typeof value === 'number' ? [ value, 'px' ] : parseUnit(value);
  if (parsed[1] === 'em') {
    return parsed[0] * font.unitsPerEm;
  } else if (parsed[1] === 'px') {
    var pxScale = 1 / font.unitsPerEm * fontSizePx;
    return parsed[0] / pxScale;
  } else {
    throw new Error('Invalid unit for getPixelSize: ' + parsed[1]);
  }
};

// Returns a scale for our paths that will match our desired font pixel size
module.exports.getScale = function (font, fontSizePx) {
  return 1 / font.unitsPerEm * fontSizePx;
};
