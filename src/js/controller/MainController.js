(function () {
  var ns = $.namespace('pskl.controller');

  ns.MainController = function (piskelController) {
    this.piskelController = piskelController;
  };

  ns.MainController.prototype.init = function () {
    $.subscribe(Events.FRAME_SIZE_CHANGED, this.onFrameSizeChange_.bind(this));
    this.onFrameSizeChange_();
  };

  ns.MainController.prototype.onFrameSizeChange_ = function () {
    var width = this.piskelController.getPiskel().getWidth();
    var height = this.piskelController.getPiskel().getHeight();

    document.body.classList.toggle('content-landscape', width >= height);
    document.body.classList.toggle('content-portrait', width <= height);
  };
})();