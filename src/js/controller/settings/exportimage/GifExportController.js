(function () {
  var ns = $.namespace('pskl.controller.settings.exportimage');

  var URL_MAX_LENGTH = 30;
  var MAX_GIF_COLORS = 256;
  var MAGIC_PINK = '#FF00FF';
  var WHITE = '#FFFFFF';

  ns.GifExportController = function (piskelController, exportController, i18n) {
    this.createGifExportDom_(i18n);

    this.i18n = i18n;
    this.piskelController = piskelController;
    this.exportController = exportController;
  };

  pskl.utils.inherit(ns.GifExportController, pskl.controller.settings.AbstractSettingController);

  ns.GifExportController.prototype.init = function () {
    this.uploadStatusContainerEl = document.querySelector('.gif-upload-status');
    this.previewContainerEl = document.querySelector('.gif-export-preview');
    this.uploadButton = document.querySelector('.gif-upload-button');
    this.downloadButton = document.querySelector('.gif-download-button');
    this.repeatCheckbox = document.querySelector('.gif-repeat-checkbox');

    // Initialize repeatCheckbox state
    this.repeatCheckbox.checked = this.getRepeatSetting_();

    this.addEventListener(this.uploadButton, 'click', this.onUploadButtonClick_);
    this.addEventListener(this.downloadButton, 'click', this.onDownloadButtonClick_);
    this.addEventListener(this.repeatCheckbox, 'change', this.onRepeatCheckboxChange_);

    var currentColors = pskl.app.currentColorsService.getCurrentColors();
    var tooManyColors = currentColors.length >= MAX_GIF_COLORS;
    document.querySelector('.gif-export-warning').classList.toggle('visible', tooManyColors);
  };

  ns.GifExportController.prototype.getZoom_ = function () {
    return this.exportController.getExportZoom();
  };

  ns.GifExportController.prototype.onUploadButtonClick_ = function (evt) {
    evt.preventDefault();
    var zoom = this.getZoom_();
    var fps = this.piskelController.getFPS();

    this.renderAsImageDataAnimatedGIF(zoom, fps, this.uploadImageData_.bind(this));
  };

  ns.GifExportController.prototype.onDownloadButtonClick_ = function (evt) {
    var zoom = this.getZoom_();
    var fps = this.piskelController.getFPS();

    this.renderAsImageDataAnimatedGIF(zoom, fps, this.downloadImageData_.bind(this));
  };

  ns.GifExportController.prototype.downloadImageData_ = function (imageData) {
    var fileName = this.piskelController.getPiskel().getDescriptor().name + '.gif';
    pskl.utils.BlobUtils.dataToBlob(imageData, 'image/gif', function(blob) {
      pskl.utils.FileUtils.downloadAsFile(blob, fileName);
    });
  };

  ns.GifExportController.prototype.uploadImageData_ = function (imageData) {
    this.updatePreview_(imageData);
    this.previewContainerEl.classList.add('preview-upload-ongoing');

    pskl.app.imageUploadService.upload(imageData,
      this.onImageUploadCompleted_.bind(this),
      this.onImageUploadFailed_.bind(this));
  };

  ns.GifExportController.prototype.onImageUploadCompleted_ = function (imageUrl) {
    this.updatePreview_(imageUrl);
    this.updateStatus_(imageUrl);
    this.previewContainerEl.classList.remove('preview-upload-ongoing');
  };

  ns.GifExportController.prototype.onImageUploadFailed_ = function (event, xhr) {
    if (xhr.status === 500) {
      $.publish(Events.SHOW_NOTIFICATION, [{
        'content': 'Upload failed : ' + xhr.responseText,
        'hideDelay' : 5000
      }]);
    }
  };

  ns.GifExportController.prototype.updatePreview_ = function (src) {
    this.previewContainerEl.innerHTML = '<div><img style="max-width:32px;" src="' + src + '"/></div>';
  };

  ns.GifExportController.prototype.renderAsImageDataAnimatedGIF = function(zoom, fps, cb) {
    var currentColors = pskl.app.currentColorsService.getCurrentColors();

    var layers = this.piskelController.getLayers();
    var isTransparent = layers.some(function (l) {return l.isTransparent();});
    var preserveColors = !isTransparent && currentColors.length < MAX_GIF_COLORS;

    var transparentColor;
    var transparent;
    // transparency only supported if preserveColors is true, see Issue #357
    if (preserveColors) {
      transparentColor = this.getTransparentColor(currentColors);
      transparent = parseInt(transparentColor.substring(1), 16);
    } else {
      transparentColor = WHITE;
      transparent = null;
    }

    var width = this.piskelController.getWidth();
    var height = this.piskelController.getHeight();

    var gif = new window.GIF({
      workers: 5,
      quality: 1,
      width: width * zoom,
      height: height * zoom,
      preserveColors : preserveColors,
      repeat: this.getRepeatSetting_() ? 0 : -1,
      transparent : transparent
    });

    // Create a background canvas that will be filled with the transparent color before each render.
    var background = pskl.utils.CanvasUtils.createCanvas(width, height);
    var context = background.getContext('2d');
    context.fillStyle = transparentColor;

    for (var i = 0 ; i < this.piskelController.getFrameCount() ; i++) {
      var render = this.piskelController.renderFrameAt(i, true);
      context.clearRect(0, 0, width, height);
      context.fillRect(0, 0, width, height);
      context.drawImage(render, 0, 0, width, height);

      var canvas = pskl.utils.ImageResizer.scale(background, zoom);
      gif.addFrame(canvas.getContext('2d'), {
        delay: 1000 / fps
      });
    }

    $.publish(Events.SHOW_PROGRESS, [{'name': this.i18n.gifExportSettingSectionBuildingAnimatedGif()}]);
    gif.on('progress', function(percentage) {
      $.publish(Events.UPDATE_PROGRESS, [{'progress': (percentage * 100).toFixed(1)}]);
    }.bind(this));

    gif.on('finished', function(blob) {
      $.publish(Events.HIDE_PROGRESS);
      pskl.utils.FileUtils.readFile(blob, cb);
    }.bind(this));

    gif.render();
  };

  ns.GifExportController.prototype.getTransparentColor = function(currentColors) {
    var transparentColor = pskl.utils.ColorUtils.getUnusedColor(currentColors);

    if (!transparentColor) {
      console.error('Unable to find unused color to use as transparent color in the current sprite');
      transparentColor = MAGIC_PINK;
    }

    return transparentColor;
  };

  ns.GifExportController.prototype.onRepeatCheckboxChange_ = function () {
    var checked = this.repeatCheckbox.checked;
    pskl.UserSettings.set(pskl.UserSettings.EXPORT_GIF_REPEAT, checked);
  };

  ns.GifExportController.prototype.getRepeatSetting_ = function () {
    return pskl.UserSettings.get(pskl.UserSettings.EXPORT_GIF_REPEAT);
  };

  ns.GifExportController.prototype.updateStatus_ = function (imageUrl, error) {
    if (imageUrl) {
      var linkTpl = '<a class="highlight" href="{{link}}" target="_blank">{{shortLink}}</a>';
      var linkHtml = pskl.utils.Template.replace(linkTpl, {
        link : imageUrl,
        shortLink : this.shorten_(imageUrl, URL_MAX_LENGTH, '...')
      });
      this.uploadStatusContainerEl.innerHTML = this.i18n.gifExportSettingSectionYourImageAvailableAt() + ' :' + linkHtml;
    } else {
      // FIXME : Should display error message instead
    }
  };

  ns.GifExportController.prototype.shorten_ = function (url, maxLength, suffix) {
    if (url.length > maxLength) {
      var index = Math.round((maxLength - suffix.length) / 2);
      var part1 = url.substring(0, index);
      var part2 = url.substring(url.length - index, url.length);
      url = part1 + suffix + part2;
    }
    return url;
  };

  ns.GifExportController.prototype.createGifExportDesc = function (i18n) {
    var templateValues = {
      description: i18n.gifExportSettingSectionDesc(),
    };
    var templateId = 'gif-export-desc-template';
    return pskl.utils.Template.fillInTemplate(templateId, templateValues);
  };

  ns.GifExportController.prototype.createGifExportWarning = function (i18n) {
    var templateValues = {
      description: i18n.gifExportSettingSectionWarningMessage(),
    };
    var templateId = 'gif-export-warning-template';
    return pskl.utils.Template.fillInTemplate(templateId, templateValues);
  };

  ns.GifExportController.prototype.createGifExportLoopRepeatedly = function (i18n) {
    var templateValues = {
      label: i18n.gifExportSettingSectionLoopRepeatedly(),
      tooltipTitle: i18n.gifExportSettingSectionUncheckToPlay()
    };
    var templateId = 'gif-export-loop-repeatedly-template';
    return pskl.utils.Template.fillInTemplate(templateId, templateValues);
  };

  ns.GifExportController.prototype.createGifExportDownloadSection = function (i18n) {
    var templateValues = {
      codeDotOrgClass: '',
      id: 'download-gif-section',
      cssClass: 'gif-download-button',
      buttonText: i18n.gifExportSettingSectionDownload(),
      description: i18n.gifExportSettingSectionDownloadDesc()
    };
    var templateId = 'gif-export-upload-download-template';
    return pskl.utils.Template.fillInTemplate(templateId, templateValues);
  };

  ns.GifExportController.prototype.createGifExportUploadSection = function (i18n) {
    var templateValues = {
      codeDotOrgClass: 'upload-gif-gamelab',
      id: 'upload-gif-section',
      cssClass: 'gif-upload-button',
      buttonText: i18n.gifExportSettingSectionUpload(),
      description: i18n.gifExportSettingSectionUploadDesc()
    };
    var templateId = 'gif-export-upload-download-template';
    return pskl.utils.Template.fillInTemplate(templateId, templateValues);
  };

  /**
  * @private
  */
  ns.GifExportController.prototype.createGifExportDom_ = function (i18n) {
    $('#export-info').html(this.createGifExportDesc(i18n));
    $('#gif-export-warning').html(this.createGifExportWarning(i18n));
    $('#loop-repeatedly-section').html(this.createGifExportLoopRepeatedly(i18n));
    var html = '';
    html += this.createGifExportDownloadSection(i18n);
    html += this.createGifExportUploadSection(i18n);
    html += '<div class=\'gif-upload\'><div class=\'gif-export-preview\'></div><div class=\'gif-upload-status\'></div></div>';
    $('#gif-export-actions-section').html(html);
  };
})();
