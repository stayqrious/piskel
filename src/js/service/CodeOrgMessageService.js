/* Code.org-specific service for managing communication with the outer page
 * when used as an embedded app in an iframe. */
(function () {
  var MessageType = PiskelApi.MessageType;

  // TODO: Rename to EmbeddedPiskelService

  /**
   * This Code.org-specific service manages communication with the document
   * outside of Piskel's iframe and with the Code.org animations API.  For
   * messages to work, the outer document must be hosted on the same origin as
   * Piskel.
   * @param {!PiskelController} piskelController
   * @param {!ImportService} importService
   * @constructor
   */
  var CodeOrgMessageService = $.namespace('pskl.service').CodeOrgMessageService = function (
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
   * @param {!Window} listenerContext
   */
  CodeOrgMessageService.prototype.init = function (listenerContext) {
    this.parentWindow_ = listenerContext.parent;

    // We only accept messages sent from the origin hosting Piskel.
    this.allowedOrigin_ = listenerContext.location.origin;
    listenerContext.addEventListener('message', this.receiveMessage_.bind(this));

    // Implementing auto-save: On a save state event, try uploading spritesheet
    // to S3.
    $.subscribe(Events.PISKEL_SAVE_STATE, this.onSaveStateEvent.bind(this));

    this.log('Initialized.');
  };

  // Debug logging utility - should remove at some point.
  var VERBOSE = true;
  CodeOrgMessageService.prototype.log = function () {
    if (VERBOSE) {
      var toLog = ['CodeOrgMessageService:'];
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
  CodeOrgMessageService.prototype.sendMessage_ = function (message) {
    this.parentWindow_.postMessage(message, this.allowedOrigin_);
  };

  /**
   * Entry point for routing messages received from the Code.org parent document.
   * @param {Event} event
   * @private
   */
  CodeOrgMessageService.prototype.receiveMessage_ = function (event) {
    // Ignore messages not sent from the allowed origin
    var origin = event.origin || event.originalEvent.origin;
    if (origin !== this.allowedOrigin_) {
      return;
    }

    var message = event.data;
    this.log('Received message:', message);
    if (message.type === MessageType.LOAD_SPRITESHEET) {
      this.loadAnimation(message.uri, message.frameSizeX, message.frameSizeY);
    }
  };

  CodeOrgMessageService.prototype.loadAnimation = function (uri, frameSizeX, frameSizeY) {
    var image = new Image();
    image.onload = function () {
      // Avoid retriggering image onload (something about JsGif?)
      image.onload = function () {};
      this.lastSaveTime_ = Date.now(); // Don't autosave right after load.
      this.importService_.newPiskelFromImage(image, {
        importType: 'spritesheet',
        frameSizeX: frameSizeX,
        frameSizeY: frameSizeY,
        frameOffsetX: 0,
        frameOffsetY: 0,
        smoothing: false
      }, function () {
        this.log('Image loaded.');
      }.bind(this));
    }.bind(this);
    image.src = uri;
  };

  var SAVE_INTERVAL_MS = 5000;
  CodeOrgMessageService.prototype.onSaveStateEvent = function (evt, action) {
    this.log('onSaveStateEvent');
    var renderer = new pskl.rendering.PiskelRenderer(this.piskelController_);
    var outputCanvas = renderer.renderAsCanvas(this.getBestFit_());
    this.sendMessage_({
      type: MessageType.STATE_SAVED,
      base64: outputCanvas.toDataURL('image/png')
      // Or do we want to export a blob here, ready to upload?  Probably that.
      // It's easier to convert blob->dataurl than the other way around.
    });
  };

  /**
   * @returns {!number} the ideal number of columns for a generated spritesheet.
   * @private
   */
  CodeOrgMessageService.prototype.getBestFit_ = function () {
    var ratio = this.piskelController_.getWidth() / this.piskelController_.getHeight();
    var frameCount = this.piskelController_.getFrameCount();
    var bestFit = Math.round(Math.sqrt(frameCount / ratio));

    return Math.max(1, Math.min(bestFit, frameCount));
  };
})();
