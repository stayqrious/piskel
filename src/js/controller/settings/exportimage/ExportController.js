(function () {
  var ns = $.namespace('pskl.controller.settings.exportimage');

  var tabs = {
    'png' : {
      template : 'templates/settings/export/png.html',
      controller : ns.PngExportController
    },
    'gif' : {
      template : 'templates/settings/export/gif.html',
      controller : ns.GifExportController
    },
    'zip' : {
      template : 'templates/settings/export/zip.html',
      controller : ns.ZipExportController
    },
    'misc' : {
      template : 'templates/settings/export/misc.html',
      controller : ns.MiscExportController
    }
  };

  ns.ExportController = function (piskelController, i18n) {
    this.createExportDom_(i18n);

    this.piskelController = piskelController;
    this.tabsWidget = new pskl.widgets.Tabs(tabs, this, pskl.UserSettings.EXPORT_TAB, i18n);
    this.onSizeInputChange_ = this.onSizeInputChange_.bind(this);
  };

  pskl.utils.inherit(ns.ExportController, pskl.controller.settings.AbstractSettingController);

  ns.ExportController.prototype.init = function() {
    // Initialize zoom controls
    this.scaleInput = document.querySelector('.export-scale .scale-input');
    this.addEventListener(this.scaleInput, 'change', this.onScaleChange_);
    this.addEventListener(this.scaleInput, 'input', this.onScaleChange_);

    this.widthInput = document.querySelector('.export-resize .resize-width');
    this.heightInput = document.querySelector('.export-resize .resize-height');
    var scale = pskl.UserSettings.get(pskl.UserSettings.EXPORT_SCALE);
    this.sizeInputWidget = new pskl.widgets.SizeInput({
      widthInput : this.widthInput,
      heightInput : this.heightInput,
      initWidth : this.piskelController.getWidth() * scale,
      initHeight : this.piskelController.getHeight() * scale,
      onChange : this.onSizeInputChange_
    });

    this.onSizeInputChange_();

    // Initialize tabs and panel
    var container = document.querySelector('.settings-section-export');
    this.tabsWidget.init(container);
  };

  ns.ExportController.prototype.destroy = function() {
    this.sizeInputWidget.destroy();
    this.tabsWidget.destroy();
    this.superclass.destroy.call(this);
  };

  ns.ExportController.prototype.onScaleChange_ = function() {
    var value = parseFloat(this.scaleInput.value);
    if (!isNaN(value)) {
      if (Math.round(this.getExportZoom()) != value) {
        this.sizeInputWidget.setWidth(this.piskelController.getWidth() * value);
      }
      pskl.UserSettings.set(pskl.UserSettings.EXPORT_SCALE, value);
    }
  };

  ns.ExportController.prototype.updateScaleText_ = function(scale) {
    scale = scale.toFixed(1);
    var scaleText = document.querySelector('.export-scale .scale-text');
    scaleText.innerHTML = scale + 'x';
  };

  ns.ExportController.prototype.onSizeInputChange_ = function() {
    var zoom = this.getExportZoom();
    if (isNaN(zoom)) {
      return;
    }

    this.updateScaleText_(zoom);
    $.publish(Events.EXPORT_SCALE_CHANGED);

    this.scaleInput.value = Math.round(zoom);
    if (zoom >= 1 && zoom <= 32) {
      this.onScaleChange_();
    }
  };

  ns.ExportController.prototype.getExportZoom = function() {
    return parseInt(this.widthInput.value, 10) / this.piskelController.getWidth();
  };

  ns.ExportController.prototype.createExportTitle = function(i18n) {
    var templateData = {
      text: i18n.exportSettingSectionTitle(),
    };
    var templateId = 'export-settings-template';
    return pskl.utils.Template.fillInTemplate(templateId, templateData);
  };

  ns.ExportController.prototype.createExportChangeScale = function(i18n) {
    var templateData = {
      tooltipTitle: i18n.exportSettingSectionScaleTheAnimation(),
      labelText: i18n.exportSettingSectionScale()
    };
    var templateId = 'export-scale-template';
    return pskl.utils.Template.fillInTemplate(templateId, templateData);
  };

  ns.ExportController.prototype.createExportChangeResolution = function (i18n) {
    var templateData = {
      spanText: i18n.exportSettingSectionResolution(),
    };
    var templateId = 'export-change-resolution-template';
    return pskl.utils.Template.fillInTemplate(templateId, templateData);
  };

  ns.ExportController.prototype.createExportTabs = function(i18n) {
    var templateData = {
      divText: i18n.exportSettingSectionOthersTab(),
    };
    var templateId = 'export-tabs-template';
    return pskl.utils.Template.fillInTemplate(templateId, templateData);
  };

  /**
  * @private
  */
  ns.ExportController.prototype.createExportDom_ = function(i18n) {
    var html = '';

    var exportTitleHtml = this.createExportTitle(i18n);
    html += exportTitleHtml;

    var exportChangeScaleHtml = this.createExportChangeScale(i18n);
    html += exportChangeScaleHtml;

    var exportChangeResolutionHtml = this.createExportChangeResolution(i18n);
    html += exportChangeResolutionHtml;

    var exportTabsHtml = this.createExportTabs(i18n);
    html += exportTabsHtml;

    html += '<div class="export-panel tab-content"></div>';
    $('#settings-section-export').html(html);
  };
})();
