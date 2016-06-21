const opentype = require('opentype.js');
const keycode = require('keycode');
const css = require('dom-css');

const drawTextDemo = require('./drawTextDemo');

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d', { alpha: true });
const element = document.querySelector('#text');
const text = element.textContent;

const toggle = (el) => {
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

window.addEventListener('keydown', (ev) => {
  var code = keycode(ev);
  if (code === 'c') {
    toggle(canvas);
  } else if (code === 'd') {
    toggle(element);
  }
});

opentype.load('demo/fonts/DejaVuSans.ttf', (err, font) => {
  if (err) throw err;

  // only render frames as needed
  window.addEventListener('resize', () => render(font));
  render(font);
});

function render (font) {
  // Apply device scaling
  const dpr = window.devicePixelRatio;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  // Scale the canvas context for retina
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  // Draw our text parts
  drawText(ctx, font, text);

  // Reset context
  ctx.restore();
}

function drawText (ctx, font) {
  const style = window.getComputedStyle(element, null);

  // Now draw our text at origin with computed CSS styles
  drawTextDemo(ctx, font, text, {
    fontSize: style.fontSize,
    left: style.left,
    top: style.top,
    textAlign: style.textAlign,
    letterSpacing: style.letterSpacing,
    width: style.width,
    lineHeight: style.lineHeight
  });
}
