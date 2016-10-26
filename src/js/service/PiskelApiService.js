/* @file Service for managing communication with an external application
 * when Piskel is embedded in an iframe. */
(function () {
  var ns = $.namespace('pskl.service');
  var MessageType = PiskelApi.MessageType;

  /**
   * Service for managing communication with an external application when
   * Piskel is embedded in an iframe. Receives from and sends to the PiskelApi
   * class; see PiskelApi.js for more information.
   *
   * @param {!PiskelController} piskelController
   * @param {!PreviewController} previewController
   * @param {!ImportService} importService
   * @constructor
   */
  ns.PiskelApiService = function (
      piskelController, previewController, importService) {
    /**
     * The main animation document controller.
     * @private {!PiskelController}
     */
    this.piskelController_ = piskelController;

    /**
     * The animation preview controller, used to get/set the current FPS for
     * the animation.
     * @private {!PreviewController}
     */
    this.previewController_ = previewController;

    /**
     * The import service we'll rely on to load animations when they are
     * selected in the outer UI.
     * @private {!ImportService}
     */
    this.importService_ = importService;

    /**
     * Reference to the parent window (in an embedded context) used to send
     * messages out of our frame.
     * @private {Window}
     */
    this.parentWindow_ = null;

    /**
     * Which origin we will receive messages from.  Set on init().
     * @private {string}
     */
    this.allowedOrigin_ = null;
  };

  /**
   * Initialize message service.  Causes service to start listening for messages
   * on window.
   * @param {!Window} piskelWindow
   */
  ns.PiskelApiService.prototype.init = function (piskelWindow) {
    this.parentWindow_ = piskelWindow.parent;

    // We only accept messages sent from the origin hosting Piskel.
    this.allowedOrigin_ = piskelWindow.location.origin;
    piskelWindow.addEventListener('message', this.receiveMessage_.bind(this));

    // For implementing auto-save: On a save state event, we should notify
    // the parent app that the animation has changed.
    $.subscribe(Events.PISKEL_SAVE_STATE, this.onSaveStateEvent.bind(this));
    $.subscribe(Events.FPS_CHANGED, this.onSaveStateEvent.bind(this));

    // Notify any attached API that piskel is ready to use.
    this.sendMessage_({type: MessageType.PISKEL_API_READY});

    this.log('Initialized.');
  };

  // Debug logging utility - should remove at some point.
  var VERBOSE = false;
  ns.PiskelApiService.prototype.log = function () {
    if (VERBOSE) {
      var toLog = ['PiskelApiService:'];
      for (var i = 0; i < arguments.length; i++) {
        toLog.push(arguments[i]);
      }
      console.log.apply(console, toLog);
    }
  };

  /**
   * Send a cross-context message out to the parent window.
   * @param {Object} message
   * @private
   */
  ns.PiskelApiService.prototype.sendMessage_ = function (message) {
    this.parentWindow_.postMessage(message, this.allowedOrigin_);
  };

  /**
   * Entry point for routing messages received from the Code.org parent document.
   * @param {Event} event
   * @private
   */
  ns.PiskelApiService.prototype.receiveMessage_ = function (event) {
    // Ignore messages not sent from the allowed origin
    var origin = event.origin || event.originalEvent.origin;
    if (origin !== this.allowedOrigin_) {
      return;
    }

    var message = event.data;
    this.log('Received message:', message);

    // Delegate according to message type
    if (message.type === MessageType.NEW_PISKEL) {
      this.createNewPiskel(message.frameSizeX, message.frameSizeY, message.frameRate);
    } else if (message.type === MessageType.LOAD_SPRITESHEET) {
      this.loadSpritesheet(message.uri, message.frameSizeX, message.frameSizeY,
          message.frameRate);
    } else if (message.type === MessageType.TOGGLE_FRAME_COLUMN) {
      this.toggleFrameColumn(message.hideFrameColumn);
    }
  };

  /**
   * @param {!number} frameSizeX
   * @param {!number} frameSizeY
   * @param {number} frameRate
   */
  ns.PiskelApiService.prototype.createNewPiskel = function (frameSizeX,
      frameSizeY, frameRate) {
    frameRate = typeof frameRate !== 'undefined' ? frameRate : Constants.DEFAULT.FPS;
    $.publish(Events.LOAD_NEW_PISKEL);

    // Generate a new blank Piskel (document)
    var descriptor = new pskl.model.piskel.Descriptor('New Piskel', '');
    var newPiskel = new pskl.model.Piskel(frameSizeX, frameSizeY, descriptor);
    var layer = new pskl.model.Layer('Layer 1');
    var frame = new pskl.model.Frame(frameSizeX, frameSizeY);
    layer.addFrame(frame);
    newPiskel.addLayer(layer);

    // Load the new blank document
    this.piskelController_.setPiskel(newPiskel);
    this.previewController_.setFPS(frameRate);
    this.sendMessage_({type: MessageType.ANIMATION_LOADED});
  };

  /**
   * @param {!string} uri
   * @param {!number} frameSizeX
   * @param {!number} frameSizeY
   * @param {number} [frameRate]
   */
  ns.PiskelApiService.prototype.loadSpritesheet = function (uri, frameSizeX,
      frameSizeY, frameRate) {
    $.publish(Events.LOAD_NEW_PISKEL);

    var image = new Image();
    image.onload = function () {
      // Avoid retriggering image onload (something about JsGif?)
      image.onload = Constants.EMPTY_FUNCTION;
      this.importService_.newPiskelFromImage(image, {
        importType: 'spritesheet',
        frameSizeX: frameSizeX,
        frameSizeY: frameSizeY,
        frameOffsetX: 0,
        frameOffsetY: 0,
        smoothing: false,
        frameRate: frameRate
      }, function () {
        this.log('Image loaded.');
        // Report async load completed.
        this.sendMessage_({type: MessageType.ANIMATION_LOADED});
      }.bind(this));
    }.bind(this);
    image.src = uri;
  };

  /**
   * @param {boolean} hideFrameColumn
   */
  ns.PiskelApiService.prototype.toggleFrameColumn = function(hideFrameColumn) {
    if (hideFrameColumn) {
      document.getElementById('preview-list-wrapper').style.display = 'none';
    } else {
      document.getElementById('preview-list-wrapper').style.display = 'unset';
    }
  };

  ns.PiskelApiService.prototype.onSaveStateEvent = function (evt, action) {
    this.log('onSaveStateEvent');
    // Render spritesheet and return blob, dataURI and metadata to parent app.
    var renderer = new pskl.rendering.PiskelRenderer(this.piskelController_);
    var outputCanvas = renderer.renderAsCanvas(this.getBestFit_());
    var dataURI = outputCanvas.toDataURL();
    pskl.utils.BlobUtils.dataToBlob(dataURI, 'image/png', function (blob) {
      this.sendMessage_({
        type: MessageType.STATE_SAVED,
        blob: blob,
        dataURI: dataURI,
        sourceSizeX: outputCanvas.width,
        sourceSizeY: outputCanvas.height,
        frameSizeX: this.piskelController_.getWidth(),
        frameSizeY: this.piskelController_.getHeight(),
        frameCount: this.piskelController_.getFrameCount(),
        frameRate: this.piskelController_.getFPS()
      });
    }.bind(this));
  };

  /**
   * @returns {!number} the ideal number of columns for a generated spritesheet.
   * @private
   */
  ns.PiskelApiService.prototype.getBestFit_ = function () {
    var ratio = this.piskelController_.getWidth() / this.piskelController_.getHeight();
    var frameCount = this.piskelController_.getFrameCount();
    var bestFit = Math.round(Math.sqrt(frameCount / ratio));

    return Math.max(1, Math.min(bestFit, frameCount));
  };
})();
