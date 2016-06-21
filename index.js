var defined = require('defined');
var wordWrapper = require('word-wrapper');
var assign = require('object-assign');

// A default 'line-height' according to Chrome/FF/Safari (Jun 2016)
var DEFAULT_LINE_HEIGHT = 1.175;

module.exports = function (font, text, opt) {
  if (!font) throw new TypeError('Must specify a font from Opentype.js');
  opt = opt || {};
  text = text || '';
  var align = defined(opt.align, 'left');
  var letterSpacing = defined(opt.letterSpacing, 0);
  var width = defined(opt.width, Infinity);

  // apply word wrapping to text
  var wrapOpts = assign({}, opt, {
    measure: measure
  });
  var lines = wordWrapper.lines(text, wrapOpts);

  // get max line width from all lines
  var maxLineWidth = lines.reduce(function (prev, line) {
    return Math.max(prev, line.width);
  }, 0);

  // As per CSS spec https://www.w3.org/TR/CSS2/visudet.html#line-height
  var AD = Math.abs(font.ascender - font.descender);
  var lineHeight = defined(opt.lineHeight, font.unitsPerEm * DEFAULT_LINE_HEIGHT); // in em units
  var L = lineHeight - AD;

  // Y position is based on CSS line height calculation
  var x = 0;
  var y = -font.ascender - L / 2;
  var totalHeight = (AD + L) * lines.length;
  var preferredWidth = isFinite(width) ? width : maxLineWidth;
  var glyphs = [];
  var lastGlyph = null;

  // Layout by line
  for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    var line = lines[lineIndex];
    var start = line.start;
    var end = line.end;
    var lineWidth = line.width;

    // Layout by glyph
    for (var j = start, c = 0; j < end; j++, c++) {
      var char = text.charAt(j);
      var glyph = getGlyph(font, char);

      // TODO:
      // Align center & right are off by a couple pixels, need to revisit.
      if (j === start && align === 'right') {
        x -= glyph.leftSideBearing;
      }

      // Apply kerning
      if (lastGlyph) {
        x += font.getKerningValue(glyph, lastGlyph) || 0;
      }

      // Align text
      var tx = 0;
      if (align === 'center') {
        tx = (preferredWidth - lineWidth) / 2;
      } else if (align === 'right') {
        tx = preferredWidth - lineWidth;
      }

      // Store glyph data
      glyphs.push({
        position: [ x + tx, y ],
        data: glyph,
        index: j,
        column: c,
        row: lineIndex
      });

      // Advance forward
      x += letterSpacing + getAdvance(glyph, char);
      lastGlyph = glyph;
    }

    // Advance down
    y -= lineHeight;
    x = 0;
  }

  // Compute left & right values
  var left = 0;
  if (align === 'center') left = (preferredWidth - maxLineWidth) / 2;
  else if (align === 'right') left = preferredWidth - maxLineWidth;
  var right = Math.max(0, preferredWidth - maxLineWidth - left);

  return {
    glyphs: glyphs,
    baseline: L / 2 + Math.abs(font.descender),
    leading: L,
    lines: lines,
    lineHeight: lineHeight,
    left: left,
    right: right,
    maxLineWidth: maxLineWidth,
    width: preferredWidth,
    height: totalHeight
  };

  function measure (text, start, end, width) {
    return computeMetrics(font, text, start, end, width, letterSpacing);
  }
};

function getRightSideBearing (glyph) {
  var glyphWidth = (glyph.xMax || 0) - (glyph.xMin || 0);
  var rsb = glyph.advanceWidth - glyph.leftSideBearing - glyphWidth;
  return rsb;
}

function computeMetrics (font, text, start, end, width, letterSpacing) {
  start = Math.max(0, defined(start, 0));
  end = Math.min(defined(end, text.length), text.length);
  width = defined(width, Infinity);
  letterSpacing = defined(letterSpacing, 0);

  var pen = 0;
  var count = 0;
  var curWidth = 0;

  for (var i = start; i < end; i++) {
    var char = text.charAt(i);

    // Tab is treated as multiple space characters
    var glyph = getGlyph(font, char);
    ensureMetrics(glyph);

    // determine kern value to next glyph
    var kerning = 0;
    if (i < end - 1) {
      var nextGlyph = getGlyph(font, text.charAt(i + 1));
      kerning += font.getKerningValue(glyph, nextGlyph);
    }

    // determine if the new pen or width is above our limit
    var xMax = glyph.xMax || 0;
    var xMin = glyph.xMin || 0;
    var glyphWidth = xMax - xMin;
    var rsb = getRightSideBearing(glyph);
    var newWidth = pen + glyph.leftSideBearing + glyphWidth + rsb;
    if (newWidth > width) {
      break;
    }

    pen += letterSpacing + getAdvance(glyph, char) + kerning;
    curWidth = newWidth;
    count++;
  }

  return {
    start: start,
    end: start + count,
    width: curWidth
  };
}

function getGlyph (font, char) {
  var isTab = char === '\t';
  return font.charToGlyph(isTab ? ' ' : char);
}

function getAdvance (glyph, char) {
  // TODO: handle tab gracefully
  return glyph.advanceWidth;
}

function ensureMetrics (glyph) {
  // Opentype.js only builds its paths when the getter is accessed
  // so we force it here.
  return glyph.path;
}
