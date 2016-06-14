/* This is a Code.org-specific module, that exposes certain constants (in
 * particular, message types) for use by a parent application. */
var ExportedConstants = (function (exports) {

  // Types of messages that this copy of Piskel can handle.
  exports.MessageType = {
    LOAD_ANIMATION: 'LOAD_ANIMATION'
  };

  return exports;
})(typeof exports !== 'undefined' ? exports : {});
