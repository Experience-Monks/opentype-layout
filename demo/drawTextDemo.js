const computeLayout = require('../');

const parseUnit = require('parse-unit');
const parseSvg = require('parse-svg-path');
const drawSvg = require('draw-svg-path');
const toSvg = require('./glyphToSvgPath');
const convert = require('./convert');

module.exports = function (ctx, font, text, styles) {
  const fontSizePx = convert.getFontSizePx(font, styles.fontSize);

  // Layout some text - notice everything is in em units!
  var result = computeLayout(font, text, {
    letterSpacing: convert.getEmUnits(font, fontSizePx, styles.letterSpacing),
    lineHeight: convert.getEmUnits(font, fontSizePx, styles.lineHeight),
    width: convert.getEmUnits(font, fontSizePx, styles.width),
    align: styles.textAlign
  });

  // Our <div> is offset 20px by left/top, let's match that.
  // We are still in pixel space so no need to scale to font EM units!
  ctx.translate(getPx(styles.left), getPx(styles.top));

  // Now scale and flip coordinates: our EM box has (0, 0) as lower left
  const pxScale = convert.getScale(font, fontSizePx);
  ctx.scale(pxScale, -pxScale);

  // We need to scale the line to adjust to the new font size
  ctx.lineWidth = 3 / pxScale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  drawMetrics();
  drawText();

  function drawMetrics () {
    const bx = result.left;
    const bh = result.height;
    const measuredWidth = result.maxLineWidth;

    // The desired box width
    ctx.strokeStyle = 'black';
    ctx.strokeRect(0, -bh, result.width, bh);

    // The actual measured text width
    ctx.strokeStyle = 'pink';
    ctx.strokeRect(bx, -bh, measuredWidth, bh);

    // From top of box to the baseline of the first line
    var lY1 = -(result.leading / 2 + font.ascender);
    ctx.strokeStyle = 'cyan';
    ctx.beginPath();
    ctx.lineTo(bx, lY1);
    ctx.lineTo(bx + measuredWidth, lY1);
    ctx.stroke();

    // From bottom of box to the baseline of last line
    var lY2 = -bh + result.baseline;
    ctx.strokeStyle = 'yellow';
    ctx.beginPath();
    ctx.lineTo(bx, lY2);
    ctx.lineTo(bx + measuredWidth, lY2);
    ctx.stroke();
  }

  function drawText () {
    result.glyphs.forEach(glyph => {
      var data = glyph.data;
      ctx.fillStyle = 'red';
      ctx.strokeStyle = 'red';
      ctx.save();
      ctx.translate(glyph.position[0], glyph.position[1]);
      ctx.beginPath();
      drawSvg(ctx, parseSvg(toSvg(data.path)));
      ctx.stroke();
      ctx.restore();
    });
  }
};

function getPx (value) {
  value = typeof value === 'string' ? parseUnit(value) : [ value, 'px' ];
  if (value[1] !== 'px') throw new TypeError('Expected px unit!');
  return value[0];
}
