(function () {
  var ns = $.namespace('pskl.tools.transform');

  ns.Center = function (i18n) {
    this.toolId = 'tool-center';
    this.helpText = i18n.alignImageToTheCenter();
    this.tooltipDescriptors = [];
    if (Constants.ENABLE_MULTIPLE_LAYERS) {
      this.tooltipDescriptors.push({key : 'ctrl', description : i18n.applyToAllLayersDescriptor()});
    }
    this.tooltipDescriptors.push({key : 'shift', description : i18n.applyToAllFramesDescriptor()});
  };

  pskl.utils.inherit(ns.Center, ns.AbstractTransformTool);

  ns.Center.prototype.applyToolOnFrame_ = function (frame) {
    ns.TransformUtils.center(frame);
  };

})();
