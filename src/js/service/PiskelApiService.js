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
   * @param {!ImportService} importService
   * @constructor
   */
  ns.PiskelApiService = function (
      piskelController, importService) {
    /**
     * The import service
     * @private {!PiskelController}
     */
    this.piskelController_ = piskelController;

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
    if (message.type === MessageType.LOAD_SPRITESHEET) {
      this.loadSpritesheet(message.uri, message.frameSizeX, message.frameSizeY,
          message.frameRate);
    }
  };

  /**
   * @param {!string} uri
   * @param {!number} frameSizeX
   * @param {!number} frameSizeY
   * @param {number} [frameRate]
   */
  ns.PiskelApiService.prototype.loadSpritesheet = function (uri, frameSizeX,
      frameSizeY, frameRate) {
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
        this.sendMessage_({type: MessageType.SPRITESHEET_LOADED});
      }.bind(this));
    }.bind(this);
    image.src = uri;
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
