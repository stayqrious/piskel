/**
 * @provide pskl.tools.drawing.FilledRectangle
 *
 * @require pskl.utils
 */
(function() {
  var ns = $.namespace('pskl.tools.drawing');

  ns.FilledRectangle = function(i18n) {
    ns.ShapeTool.call(this, i18n);

    this.toolId = 'tool-filled-rectangle';
    this.helpText = i18n.filledRectangleTool();
    this.shortcut = pskl.service.keyboard.Shortcuts.TOOL.FILLED_RECTANGLE;
  };

  pskl.utils.inherit(ns.FilledRectangle, ns.ShapeTool);

  /**
   * @override
   */
  ns.FilledRectangle.prototype.draw = function (col, row, color, targetFrame, penSize) {
    var rectangle = pskl.PixelUtils.getOrderedRectangleCoordinates(this.startCol, this.startRow, col, row);

    for (var x = rectangle.x0; x <= rectangle.x1; x++) {
      for (var y = rectangle.y0; y <= rectangle.y1; y++) {
        targetFrame.setPixel(x, y, color);
      }
    }
  };
})();
