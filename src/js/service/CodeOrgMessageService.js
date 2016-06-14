/* Code.org-specific service for managing communication with the outer page
 * when used as an embedded app in an iframe. */
(function () {
  var ns = $.namespace('pskl.service');

  /**
   * @param {!ImportService} importService
   * @constructor
   */
  ns.CodeOrgMessageService = function (importService) {
    /**
     * The import service we'll rely on to load animations when they are
     * selected in the outer UI.
     * @private {!ImportService}
     */
    this.importService_ = importService;

    /**
     * Which origin we will receive messages from.  Set on init().
     * @private {string}
     */
    this.allowedOrigin_ = null;
  };

  /**
   * Initialize message service.  Causes service to start listening for messages
   * on window.
   * @param {!Window} window
   */
  ns.CodeOrgMessageService.prototype.init = function (window) {
    // We only accept messages sent from the origin hosting Piskel.
    this.allowedOrigin_ = window.location.origin;
    window.addEventListener('message', this.receiveMessage_.bind(this));
  };

  /**
   * Entry point for routing messages received from the Code.org parent document.
   * @param {Event} event
   * @private
   */
  ns.CodeOrgMessageService.prototype.receiveMessage_ = function (event) {
    // Ignore messages not sent from the allowed origin
    var origin = event.origin || event.originalEvent.origin;
    if (origin !== this.allowedOrigin_) {
      return;
    }

    var message = event.data;
    // TODO: supply an exported LOAD_IMAGE constant.
    if (message.type === 'LOAD_IMAGE') {
      this.loadAnimation(message.animation);
    }
  };

  ns.CodeOrgMessageService.prototype.loadAnimation = function (animation) {
    var image = new Image();
    image.onload = function () {
      // Avoid retriggering image onload (something about JsGif?)
      image.onload = function () {};
      this.importService_.newPiskelFromImage(image, {
        importType: 'spritesheet',
        frameSizeX: animation.frameSize.x,
        frameSizeY: animation.frameSize.y,
        frameOffsetX: 0,
        frameOffsetY: 0,
        smoothing: false
      });
    }.bind(this);
    image.src = animation.sourceUrl;
  };
})();
