(function () {
  var ns = $.namespace('pskl.tools.transform');

  ns.Rotate = function (i18n) {
    this.toolId = 'tool-rotate';
    this.helpText = i18n.counterClockwiseRotation();

    this.tooltipDescriptors = [{key : 'alt', description : i18n.counterClockwiseRotationDescriptorRotation()}];
    if (Constants.ENABLE_MULTIPLE_LAYERS) {
      this.tooltipDescriptors.push({key : 'ctrl', description : i18n.applyToAllLayersDescriptor()});
    }
    this.tooltipDescriptors.push({key : 'shift', description : i18n.applyToAllFramesDescriptor()});
  };

  pskl.utils.inherit(ns.Rotate, ns.AbstractTransformTool);

  ns.Rotate.prototype.applyToolOnFrame_ = function (frame, altKey) {
    var direction;

    if (altKey) {
      direction = ns.TransformUtils.CLOCKWISE;
    } else {
      direction = ns.TransformUtils.COUNTERCLOCKWISE;
    }

    ns.TransformUtils.rotate(frame, direction);
  };

})();
