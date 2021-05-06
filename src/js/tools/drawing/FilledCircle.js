/**
 * @provide pskl.tools.drawing.FilledCircle
 *
 * @require pskl.utils
 */
(function() {
  var ns = $.namespace('pskl.tools.drawing');

  ns.FilledCircle = function(i18n) {
    ns.ShapeTool.call(this, i18n);

    this.toolId = 'tool-filled-circle';
    this.helpText = i18n.filledCircleTool();
    this.shortcut = pskl.service.keyboard.Shortcuts.TOOL.FILLED_CIRCLE;
  };

  pskl.utils.inherit(ns.FilledCircle, ns.ShapeTool);

  /**
   * @override
   */
  ns.FilledCircle.prototype.draw = function(col, row, color, targetFrame) {
    this.getFilledCirclePixels_(this.startCol, this.startRow, col, row).forEach(
      function(point) {
        targetFrame.setPixel(point[0], point[1], color);
      }
    );
  };

  ns.FilledCircle.prototype.getFilledCirclePixels_ = function(x0, y0, x1, y1) {
    var coords = pskl.PixelUtils.getOrderedRectangleCoordinates(x0, y0, x1, y1);
    var pixels = [];
    var xC = Math.round((coords.x0 + coords.x1) / 2);
    var yC = Math.round((coords.y0 + coords.y1) / 2);
    var evenX = (coords.x0 + coords.x1) % 2;
    var evenY = (coords.y0 + coords.y1) % 2;
    var rX = coords.x1 - xC;
    var rY = coords.y1 - yC;

    var x;
    var y;
    var angle;
    var r;

    for (x = coords.x0; x <= xC; x++) {
      angle = Math.acos((x - xC) / rX);
      y = Math.round(rY * Math.sin(angle) + yC);
      for (var yCoord = 2 * yC - y - evenY; yCoord <= y; yCoord++) {
        pixels.push([x - evenX, yCoord]);
        pixels.push([2 * xC - x, yCoord]);
      }
    }
    for (y = coords.y0; y <= yC; y++) {
      angle = Math.asin((y - yC) / rY);
      x = Math.round(rX * Math.cos(angle) + xC);
      for (var xCoord = 2 * xC - x - evenX; xCoord <= x; xCoord++) {
        pixels.push([xCoord, y - evenY]);
        pixels.push([xCoord, 2 * yC - y]);
      }
    }

    return pixels;
  };
})();
