var PiskelApi = (function (module) {

  /**
   * External API that a parent application can use to communicate with an
   * embedded copy of Piskel editor.  Once initialized with a reference to the
   * iframe hosting Piskel, this class can handle all communication between the
   * two applications.
   *
   * A current limitation (for security reasons) is that the embedded copy of
   * Piskel must have the same origin as the parent application.
   *
   * @example
   *   var PiskelApi = require('piskel');
   *   var piskelApi = new PiskelApi(document.querySelector('iframe'));
   *   piskelApi.loadSpritesheet(myImage, 256, 128);
   *
   * @param {iframe} iframe hosting an embedded Piskel editor
   * @constructor
   */
  function PiskelApi(iframe) {
    /** @private {iframe} */
    this.iframe_ = iframe;

    /** @private {Object.<string, function[]>} */
    this.callbacks_ = {};

    // Subscribe to messages from Piskel.
    window.addEventListener('message', this.receiveMessage_.bind(this));
    // TODO: Have ability to tear down this API.
  }

  /** @enum {string} Message type constants for Piskel internal use. */
  PiskelApi.MessageType = {
    // Load a spritesheet for editing
    // Arguments: uri, frameSizeX, frameSizeY
    LOAD_SPRITESHEET: 'LOAD_SPRITESHEET',

    // Requested spritesheet load has completed
    // Arguments: none
    SPRITESHEET_LOADED: 'SPRITESHEET_LOADED',

    // The animation changed, and Piskel has internally saved its state.
    // Arguments: ???
    STATE_SAVED: 'STATE_SAVED'
  };

  /**
   * Tell Piskel to load a spritesheet for editing, replacing whatever document
   * is currently open in the editor.  Assumes that frames in the spritesheet
   * will have a uniform size, and be arranged in a grid read left-to-right,
   * then top-to-bottom.
   * @param {!string} uri - An image url, or a data URI corresponding to a
   *        spritesheet image that Piskel can load.
   * @param {number} frameSizeX - Width of a frame within the spritesheet, in
   *        pixels.
   * @param {number} frameSizeY - Height of a frame within the spritesheet, in
   *        pixels.
   * @param {number} [frameRate] - Animation rate in frames per second.
   * @param {function} [onComplete] - Called when the spritesheet is loaded.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/data_URIs
   */
  PiskelApi.prototype.loadSpritesheet = function (uri, frameSizeX, frameSizeY, frameRate, onComplete) {
    onComplete = typeof onComplete === 'function' ? onComplete : Constants.EMPTY_FUNCTION;

    // Hook up the one-time onComplete callback.
    var callback = function () {
      this.removeCallback_(PiskelApi.MessageType.SPRITESHEET_LOADED, callback);
      onComplete();
    }.bind(this);
    this.addCallback_(PiskelApi.MessageType.SPRITESHEET_LOADED, callback);

    // Send the load message to Piskel.
    this.sendMessage_({
      type: PiskelApi.MessageType.LOAD_SPRITESHEET,
      uri: uri,
      frameSizeX: frameSizeX,
      frameSizeY: frameSizeY,
      frameRate: frameRate
    });
  };

  /**
   * Register a callback that will be called whenever Piskel issues a
   * save event.
   * @param callback
   */
  PiskelApi.prototype.onStateSaved = function (callback) {
    this.addCallback_(PiskelApi.MessageType.STATE_SAVED, callback);
  };

  /**
   * Send a message to Piskel.
   * @param {!Object} message
   * @private
   */
  PiskelApi.prototype.sendMessage_ = function (message) {
    this.iframe_.contentWindow.postMessage(message, window.location.origin);
  };

  /**
   * Called when Piskel sends a message to the external application.
   * @param {Event} event
   * @private
   */
  PiskelApi.prototype.receiveMessage_ = function (event) {
    // Ignore messages not sent from the allowed origin
    var origin = event.origin || event.originalEvent.origin;
    if (origin !== window.location.origin) {
      return;
    }

    var message = event.data;
    if (typeof message.type === 'undefined') {
      return;
    }

    this.getCallbacksForType_(message.type).forEach(function (callback) {
      callback.call(undefined, message); // TODO: Unpack message?
    });
  };

  /**
   * @param {string} type
   * @param {function} callback
   * @private
   */
  PiskelApi.prototype.addCallback_ = function (type, callback) {
    this.getCallbacksForType_(type).push(callback);
  };

  /**
   * Remove one registered instance of the exact given callback for the given
   * type.  Silent no-op if callback is not found.
   * @param {string} type
   * @param {function} callback
   * @private
   */
  PiskelApi.prototype.removeCallback_ = function (type, callback) {
    var callbacks = this.getCallbacksForType_(type);
    var index = callbacks.indexOf(callback);
    if (index >= 0) {
      callbacks.splice(index, 1);
    }
  };

  /**
   * @param {string} type
   * @returns {function[]}
   * @private
   */
  PiskelApi.prototype.getCallbacksForType_ = function (type) {
    if (typeof this.callbacks_[type] === 'undefined') {
      this.callbacks_[type] = [];
    }
    return this.callbacks_[type];
  };

  module.exports = PiskelApi;
  return PiskelApi;
})(typeof module !== 'undefined' ? module : {});
