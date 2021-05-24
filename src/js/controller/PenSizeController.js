(function () {
  var ns = $.namespace('pskl.controller');

  ns.PenSizeController = function (i18n) {
    this.createPenSizeDom_(i18n);
    this.sizePicker = new pskl.widgets.SizePicker(this.onSizePickerChanged_.bind(this));
  };

  ns.PenSizeController.prototype.init = function () {
    this.sizePicker.init(document.querySelector('.pen-size-container'));

    $.subscribe(Events.PEN_SIZE_CHANGED, this.onPenSizeChanged_.bind(this));
    this.updateSelectedOption_();
  };

  ns.PenSizeController.prototype.onSizePickerChanged_ = function (size) {
    pskl.app.penSizeService.setPenSize(size);
  };

  ns.PenSizeController.prototype.onPenSizeChanged_ = function (e) {
    this.updateSelectedOption_();
  };

  ns.PenSizeController.prototype.updateSelectedOption_ = function () {
    var size = pskl.app.penSizeService.getPenSize();
    this.sizePicker.setSize(size);
  };

  ns.PenSizeController.prototype.createChangePenSize = function (i18n) {
    var templateValues = {
      title: i18n.penSizeChangeTitle() + '</br>' + i18n.penSizeChangeAvailableSizes(),
    };
    var templateId = 'change-pen-size-template';
    return pskl.utils.Template.fillInTemplate(templateId, templateValues);
  };

  /**
   * @private
   */
  ns.PenSizeController.prototype.createPenSizeDom_ = function (i18n) {
    $('#pen-size-container').html(this.createChangePenSize(i18n));
  };
})();
