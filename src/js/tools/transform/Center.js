(function () {
  var ns = $.namespace('pskl.tools.transform');

  ns.Center = function () {
    this.toolId = 'tool-center';
    this.helpText = 'Align image to the center';
    this.tooltipDescriptors = [
      {key : 'ctrl', description : 'Apply to all layers'},
      {key : 'shift', description : 'Apply to all frames'}
    ];
    if (!Constants.ENABLE_MULTIPLE_LAYERS) {
      this.tooltipDescriptors.splice(0, 1);
    }
  };

  pskl.utils.inherit(ns.Center, ns.AbstractTransformTool);

  ns.Center.prototype.applyToolOnFrame_ = function (frame) {
    ns.TransformUtils.center(frame);
  };

})();
