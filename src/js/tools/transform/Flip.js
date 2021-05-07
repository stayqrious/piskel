(function () {
  var ns = $.namespace('pskl.tools.transform');

  ns.Flip = function (i18n) {
    this.toolId = 'tool-flip';
    this.helpText = i18n.flip();

    this.tooltipDescriptors = [{key : 'alt', description : i18n.flipDescriptorHorizontal()}];
    if (Constants.ENABLE_MULTIPLE_LAYERS) {
      this.tooltipDescriptors.push({key : 'ctrl', description : i18n.applyToAllLayersDescriptor()});
    }
    this.tooltipDescriptors.push({key : 'shift', description : i18n.applyToAllFramesDescriptor()});
  };

  pskl.utils.inherit(ns.Flip, ns.AbstractTransformTool);

  ns.Flip.prototype.applyToolOnFrame_ = function (frame, altKey) {
    var axis;

    if (altKey) {
      axis = ns.TransformUtils.HORIZONTAL;
    } else {
      axis = ns.TransformUtils.VERTICAL;
    }

    ns.TransformUtils.flip(frame, axis);
  };

})();
