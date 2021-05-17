(function () {
  var ns = $.namespace('pskl.controller.settings.exportimage');
  var i18n = {
    'penTool': 'Pen tool (P)',
    'paintBucketTool': 'Paint bucket tool (B)',
    'eraserTool': 'Eraser tool (E)',
    'strokeTool': 'Stroke tool (L)',
    'rectangleTool': 'Rectangle tool (R)',
    'filledRectangleTool': 'Filled Rectangle Tool (ctrl+shift+R)',
    'circleTool': 'Circle tool (C)',
    'filledCircleTool': 'Filled Circle tool (ctrl+shift+C)',
    'rectangleSelection': 'Rectangle Selection (S)',
    'colorPicker': 'Color picker (O)',
    'primaryLeftMouseButton': 'Primary - left mouse button',
    'secondaryRightMouseButton': 'Secondary - right mouse button',
    'penSize': 'Pen size at 1, 4, 8, or 16 pixels',
    'cropTheSprite': 'Crop the sprite',
    'primaryValue': 'Value',
    'secondaryValue': 'Value',
    'swapColors': 'Swap colors (X)',

    'strokeToolInstructions': 'Hold shift to draw straight lines',
    'rectangleToolInstructions': 'SHIFT Keep 1 to 1 ratio',
    'filledRectangleToolInstructions': 'SHIFT Keep 1 to 1 ratio',
    'circleToolInstructions': 'SHIFT Keep 1 to 1 ratio',
    'filledCircleToolInstructions': 'SHIFT Keep 1 to 1 ratio',
    'cropTheSpriteInstructions': 'Crop to fit the content or the selection. Applies to all frames and layers!',

    'zipExportSettingSectionDesc': 'ZIP archive containing one PNG for each frame. File names will start with the prefix below. TEST 6',
    'zipExportSettingSectionPrefix': 'Prefix TEST 7',
    'zipExportSettingSectionPNGFilePrefix': 'PNG file prefix ... TEST 8',
    'zipExportSettingSectionSplitByLayers': 'Split by layers TEST 9',
    'zipExportSettingSectionDownloadZip': 'Download ZIP TEST 10',

    'loadingPiskelMessage': 'Loading Piskel...'
  };


  // ns.ZipExportController = function (piskelController, exportController, i18n) {
  ns.ZipExportController = function (piskelController, exportController) {
    this.createZipExportDom_(i18n);

    this.piskelController = piskelController;
    this.exportController = exportController;
  };

  pskl.utils.inherit(ns.ZipExportController, pskl.controller.settings.AbstractSettingController);

  ns.ZipExportController.prototype.init = function () {
    this.pngFilePrefixInput = document.querySelector('.zip-prefix-name');
    this.pngFilePrefixInput.value = 'sprite_';

    this.splitByLayersCheckbox =  document.querySelector('.zip-split-layers-checkbox');

    var zipButton = document.querySelector('.zip-generate-button');
    this.addEventListener(zipButton, 'click', this.onZipButtonClick_);
  };

  ns.ZipExportController.prototype.onZipButtonClick_ = function () {
    var zip = new window.JSZip();

    if (this.splitByLayersCheckbox.checked) {
      this.splittedExport_(zip);
    } else {
      this.mergedExport_(zip);
    }

    var fileName = this.getPiskelName_() + '.zip';

    var blob = zip.generate({
      type : 'blob'
    });

    pskl.utils.FileUtils.downloadAsFile(blob, fileName);
  };

  ns.ZipExportController.prototype.mergedExport_ = function (zip) {
    var paddingLength = ('' + this.piskelController.getFrameCount()).length;
    var zoom = this.exportController.getExportZoom();
    for (var i = 0; i < this.piskelController.getFrameCount(); i++) {
      var render = this.piskelController.renderFrameAt(i, true);
      var canvas = pskl.utils.ImageResizer.scale(render, zoom);
      var basename = this.pngFilePrefixInput.value;
      var id = pskl.utils.StringUtils.leftPad(i, paddingLength, '0');
      var filename = basename + id + '.png';
      zip.file(filename, pskl.utils.CanvasUtils.getBase64FromCanvas(canvas) + '\n', {base64: true});
    }
  };

  ns.ZipExportController.prototype.splittedExport_ = function (zip) {
    var layers = this.piskelController.getLayers();
    var framePaddingLength = ('' + this.piskelController.getFrameCount()).length;
    var layerPaddingLength = ('' + layers.length).length;
    var zoom = this.exportController.getExportZoom();
    for (var j = 0; this.piskelController.hasLayerAt(j); j++) {
      var layer = this.piskelController.getLayerAt(j);
      var layerid = pskl.utils.StringUtils.leftPad(j, layerPaddingLength, '0');
      for (var i = 0; i < this.piskelController.getFrameCount(); i++) {
        var render = pskl.utils.LayerUtils.renderFrameAt(layer, i, true);
        var canvas = pskl.utils.ImageResizer.scale(render, zoom);
        var basename = this.pngFilePrefixInput.value;
        var frameid = pskl.utils.StringUtils.leftPad(i + 1, framePaddingLength, '0');
        var filename = 'l' + layerid + '_' + basename + frameid + '.png';
        zip.file(filename, pskl.utils.CanvasUtils.getBase64FromCanvas(canvas) + '\n', {base64: true});
      }
    }
  };

  ns.ZipExportController.prototype.getPiskelName_ = function () {
    return this.piskelController.getPiskel().getDescriptor().name;
  };

  ns.ZipExportController.prototype.createExportInfoDesc = function (i18n) {
    var tpl = pskl.utils.Template.get('export-info-desc-template');
    return pskl.utils.Template.replace(tpl, {
      text: i18n.zipExportSettingSectionDesc,
    });
  };

  ns.ZipExportController.prototype.createExportInfoPrefix = function (i18n) {
    var tpl = pskl.utils.Template.get('export-info-prefix-template');
    return pskl.utils.Template.replace(tpl, {
      text: i18n.zipExportSettingSectionPrefix,
      inputText: i18n.zipExportSettingSectionPNGFilePrefix
    });
  };

  ns.ZipExportController.prototype.createExportInfoLayers = function (i18n) {

  };

  ns.ZipExportController.prototype.createExportInfoDownloadButton = function (i18n) {
    var tpl = pskl.utils.Template.get('export-info-download-button-template');
    return pskl.utils.Template.replace(tpl, {
      text: i18n.zipExportSettingSectionDownloadZip
    });
  };

  /**
  * @private
  */
  ns.ZipExportController.prototype.createZipExportDom_ = function (i18n) {
    console.log('Inside createZipExportDom_()');

    var html = '';
    var exportInfoDescHtml = this.createExportInfoDesc(i18n);
    html += exportInfoDescHtml;
    $('#export-info').html(html);

    html = '';
    var exportInfoPrefixHtml = this.createExportInfoPrefix(i18n);
    html += exportInfoPrefixHtml;

    var exportInfoLayersHtml = this.createExportInfoLayers(i18n);
    html += exportInfoLayersHtml;

    var exportInfoDownloadButtonHtml = this.createExportInfoDownloadButton(i18n);
    html += exportInfoDownloadButtonHtml;

    $('#export-panel-section').html(html);
  };
})();
