/* @file Image and Animation import service supporting the import dialog. */
(function () {
  var ns = $.namespace('pskl.service');
  /**
   * Image an animation import service supporting the import dialog.
   * @param {!PiskelController} piskelController
   * @param {!PreviewController} previewController
   * @constructor
   */
  ns.ImportService =
      function (piskelController, previewController) {
    this.piskelController_ = piskelController;
    this.previewController_ = previewController;
  };

  /**
   * Given an image object and some options, create a new Piskel and open it
   * for editing.
   * @param {!Image} image
   * @param {!Object} options
   * @param {!string} options.importType - 'single' if not spritesheet
   * @param {!number} options.frameSizeX
   * @param {!number} options.frameSizeY
   * @param {number} [options.frameOffsetX] only used in spritesheet imports.
   * @param {number} [options.frameOffsetY] only used in spritesheet imports.
   * @param {!boolean} options.smoothing
   * @param {number} [options.frameRate] in frames per second
   * @param {function} [onComplete]
   */
  ns.ImportService.prototype.newPiskelFromImage = function (image, options, onComplete) {
    onComplete = onComplete || Constants.EMPTY_FUNCTION;
    var importType = options.importType;
    var frameSizeX = options.frameSizeX;
    var frameSizeY = options.frameSizeY;
    var frameOffsetX = options.frameOffsetX;
    var frameOffsetY = options.frameOffsetY;
    var smoothing = options.smoothing;
    var frameRate = typeof options.frameRate !== 'undefined' ?
        options.frameRate : Constants.DEFAULT.FPS;

    var setPiskelFromFrameImages = function (frameImages) {
      var piskel = this.createPiskelFromImages_(frameImages, frameSizeX,
          frameSizeY, smoothing);
      this.piskelController_.setPiskel(piskel);
      this.previewController_.setFPS(frameRate);
    }.bind(this);

    var gifLoader = new window.SuperGif({
      gif: image
    });

    gifLoader.load({
      success: function () {
        var images = gifLoader.getFrames().map(function (frame) {
          return pskl.utils.CanvasUtils.createFromImageData(frame.data);
        });

        if (importType === 'single' || images.length > 1) {
          // Single image import or animated gif
          setPiskelFromFrameImages(images);
        } else {
          // Spritesheet
          var frameImages = this.createImagesFromSheet_(images[0]);
          setPiskelFromFrameImages(frameImages);
        }
        onComplete();
      }.bind(this),
      error: function () {
        if (importType === 'single') {
          // Single image
          setPiskelFromFrameImages([image]);
        } else {
          // Spritesheet
          var frameImages = this.createImagesFromSheet_(image, frameSizeX, frameSizeY, frameOffsetX, frameOffsetY);
          setPiskelFromFrameImages(frameImages);
        }
        onComplete();
      }.bind(this)
    });
  };

  /**
   * @param {!Image} image
   * @param {!number} frameSizeX
   * @param {!number} frameSizeY
   * @param {!number} frameOffsetX
   * @param {!number} frameOffsetY
   * @returns {canvas[]}
   * @private
   */
  ns.ImportService.prototype.createImagesFromSheet_ = function (image,
      frameSizeX, frameSizeY, frameOffsetX, frameOffsetY) {
    return pskl.utils.CanvasUtils.createFramesFromImage(
        image,
        frameOffsetX,
        frameOffsetY,
        frameSizeX,
        frameSizeY,
        /*useHorizonalStrips=*/ true,
        /*ignoreEmptyFrames=*/ true);
  };

  /**
   * @param {canvas[]} images
   * @param {!number} frameSizeX
   * @param {!number} frameSizeY
   * @param {!boolean} smoothing
   * @return {pskl.model.Piskel}
   * @private
   */
  ns.ImportService.prototype.createPiskelFromImages_ = function (images,
      frameSizeX, frameSizeY, smoothing) {
    var frames = this.createFramesFromImages_(images, frameSizeX, frameSizeY, smoothing);
    var layer = pskl.model.Layer.fromFrames('Layer 1', frames);
    var descriptor = new pskl.model.piskel.Descriptor('Imported piskel', '');
    return pskl.model.Piskel.fromLayers([layer], descriptor);
  };

  /**
   * @param {!canvas[]} images
   * @param {!number} frameSizeX
   * @param {!number} frameSizeY
   * @param {!boolean} smoothing
   * @returns {pskl.model.Frame[]}
   * @private
   */
  ns.ImportService.prototype.createFramesFromImages_ = function (images, frameSizeX, frameSizeY, smoothing) {
    return images.map(function (image) {
      var resizedImage = pskl.utils.ImageResizer.resize(image, frameSizeX, frameSizeY, smoothing);
      return pskl.utils.FrameUtils.createFromImage(resizedImage);
    });
  };

  /**
   * Adds frames from an additionalPiskel to an originalPiskel, adjusting the size of
   * both piskels to the largest dimensions of either piskel, and centering the content.
   * This will only work when there is only one layer.
   * Multi layer animations are disabled from the UI in code-dot-org/piskel
   * @param {!pskl.model.Piskel} originalPiskel
   * @param {!pskl.model.Piskel} additionalPiskel
   * @returns {pskl.model.Piskel}
   */
  ns.ImportService.prototype.mergePiskels = function(originalPiskel, additionalPiskel) {
    if (originalPiskel.layers.length != 1 || originalPiskel.layers.length != 1) {
      throw new Error(
        'mergePiskels was provided with piskel parameters with more than one layer');
    }

    var maxWidth = Math.max(originalPiskel.width, additionalPiskel.width);
    var maxHeight = Math.max(originalPiskel.height, additionalPiskel.height);

    this.resizePiskel(additionalPiskel, maxWidth, maxHeight);
    this.resizePiskel(originalPiskel, maxWidth, maxHeight);

    for (var i = 0; i < additionalPiskel.layers[0].size(); i++) {
      originalPiskel.layers[0].addFrame(additionalPiskel.layers[0].getFrameAt(i));
    }
    return originalPiskel;
  };

  /**
   * @param {!pskl.model.Piskel} piskel
   * @param {!number} width
   * @param {!number} height
   */
  ns.ImportService.prototype.resizePiskel = function(piskel, width, height) {
    if (piskel.width < width || piskel.height < height) {
      var numFrames = piskel.layers[0].size();
      for (var j = 0; j < numFrames; j++) {
        var resizedFrame = this.setFrameSize(piskel.layers[0].getFrameAt(j), width, height);
        piskel.layers[0].replaceFrameAt(resizedFrame, j);
      }
      piskel.width = width;
      piskel.height = height;
    }
  };

  /**
   * Modified from ResizeController
   * @param {!pskl.model.Frame} frame
   * @param {!number} width
   * @param {!number} height
   * @returns {pskl.model.Frame}
   */
  ns.ImportService.prototype.setFrameSize = function (frame, width, height) {
    var resizedFrame = new pskl.model.Frame(width, height);
    var xOffset = Math.round((width - frame.width) / 2);
    var yOffset = Math.round((height - frame.height) / 2);
    frame.forEachPixel(function (color, x, y) {
      resizedFrame.setPixel(x + xOffset, y + yOffset, color);
    });
    return resizedFrame;
  };
})();
