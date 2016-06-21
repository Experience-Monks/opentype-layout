module.exports = getSvgPath;
function getSvgPath (path) {
  return path.commands.map(function (command) {
    var x = String(command.x);
    var y = String(command.y);
    var type = command.type;
    switch (type) {
      case 'Z':
        return type;
      case 'M':
      case 'L':
        return [ type + x, y ].join(' ');
      case 'Q':
        return [ type + String(command.x1), String(command.y1), x, y ].join(' ');
      case 'C':
        return [ type +
          String(command.x1), String(command.y1),
          String(command.x2), String(command.y2),
          x, y
        ].join(' ');
      default:
        throw new Error('invalid glyph path type: ' + type);
    }
  }).join(' ');
}
