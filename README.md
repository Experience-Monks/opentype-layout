# opentype-layout

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Experimental word-wrapping and layout for [Opentype.js](https://github.com/nodebox/opentype.js).

<img src="http://i.imgur.com/Sq3WFJX.png" width="50%" />

## Install

Best used with npm and browserify. This should also work in Node.js and other environments.

```sh
npm install opentype-layout --save
```

## Demo

[Live Demo](https://jam3.github.io/opentype-layout/)

The demo shows Canvas2D vector text (red stroke) rendered on top of DOM/CSS (black fill). The demo reads the computed CSS style and converts units into the proper EM font units. Some lines also visualize some of the available metrics.

[<img src="http://i.imgur.com/ThVDUtX.png" width="50%" />](https://jam3.github.io/opentype-layout/)

## Example

See the [demo](./demo) folder for a complete example.

```js
var opentype = require('opentype.js');
var computeLayout = require('opentype-layout');

opentype.load('Font.ttf', function (err, font) {
  if (err) throw err;

  var fontSizePx = 72;
  var text = 'Hello\nWorld! This box should start word-wrapping!'
  var scale = 1 / font.unitsPerEm * fontSizePx;

  // Layout some text - notice everything is in em units!
  var result = computeLayout(font, text, {
    lineHeight: 2.5 * font.unitsPerEm, // '2.5em' in font units
    width: 500 / scale // '500px' in font units
  });

  // Array of characters after layout
  console.log(result.glyphs);

  // Computed height after word-wrap
  console.log(result.height);
});
```

## Usage

#### `layout = computeLayout(font, text, [opt])`

Computes a new layout from the given Opentype.js `Font` interface and a `text` string.

All units should be in raw font units in the EM square, assuming a lower-left origin. For example, a `lineHeight` of `'2em'` should be passed as `2 * font.unitsPerEm`. It is up to the user to scale the results to a pixel/point size after the fact.

Options:

- `width` the width of the box in font units, will cause word-wrapping (default `Infinity`)
- `align` string alignment of the text within its `width` (default `'left'`)
- `letterSpacing` the additional letter spacing in font units (default 0)
- `lineHeight` the line height in font units as per CSS spec, default `1.175 * font.unitsPerEm` to match browsers
- `start` the starting character index into `text` to layout, default 0
- `end` the ending index into `text` to layout (exclusive), default `text.length`
- `mode` can be 'pre' (maintain spacing), or 'nowrap' (collapse whitespace but only break on newline characters), otherwise defaults to normal word-wrap behaviour

See [word-wrapper](https://www.npmjs.com/package/word-wrapper) for details on how word wrapping is computed.

## Metrics

The returned object has the following metrics.

#### `layout.glyphs`

This provides an array of characters after layout, useful for rendering. Each element in the array has the following properties:

```js
{
  position: [ x, y ],
  data: { ... Opentype.js Glyph object ... },
  index: charIndex,
  row: lineIndex,
  column: columnInLineIndex
}
```

The position is in raw font units.

#### `layout.baseline`

This is the value from pen origin to the baseline of the last line of text in the layout.

#### `layout.leading`

This is the `L` value in the [CSS line-height spec](https://www.w3.org/TR/CSS2/visudet.html#line-height). Divide this by two for the "half-leading", which tells you how far above the first ascender and below the last descender the text box extends to. 

#### `layout.lines`

This is an array of line objects with the following properties:

```js
{
  start: startCharIndex, // inclusive
  end: endCharIndex, // exclusive
  width: lineWidth // in font units
}
```

#### `layout.lineHeight`

This is the computed `lineHeight` in font units. If no `lineHeight` is specified in options, it will be equivalent to `1.175 * font.unitsPerEm`.

#### `layout.left`

This is the distance from the left of the text box to the widest line of text in the box. This is zero when `align` is left, but changes with other alignments.

#### `layout.right`

This is the distance from the right of the box to the widest line of text in the box. This is zero when `align` is right, but changes with other alignments.

#### `layout.width`

The width of the text box. If no `opt.width` is passed, this will equal `layout.maxLineWidth` (i.e. length of a single line of text). If `opt.width` is passed, this value should equal it.

#### `layout.height`

The height of the text box, including the half leadings above the first ascender and below the last descender.

#### `layout.maxLineWidth`

This is the maximum line width in all lines. This can be used to determine the "real" width of the text box after word wrap, instead of the `layout.width` which may be larger.

## TODOs

This module is not yet finished — below are some areas that need improvement. PRs welcome.

- `'center'` and `'right'` alignment do not match exactly with DOM/CSS
- Tab characters are not yet handled
- Undefined characters are not yet handled gracefully
- Word wrap algorithm is naïve and does not always match DOM/CSS
- Mainly suited for Latin left-to-right text, does not handle CTL

## License

MIT, see [LICENSE.md](http://github.com/Jam3/opentype-layout/blob/master/LICENSE.md) for details.
