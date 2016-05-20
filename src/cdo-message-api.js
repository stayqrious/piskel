(function () {

  /**
   * Main entry point for messages received from outside the iframe.  This method
   * is effectively a router for incoming commands.
   * @param event
   */
  function receiveMessage(event) {
    // Should validate origin and not receive commands if embedded on another
    // domain.
    // TODO (bbuchanan): Safer cross-domain check.
    var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
    if (!/studio\.code\.org/i.test(origin))
      return;

    var message = event.data;
    if (message.type === 'LOAD_IMAGE') {
      alert('Received LOAD_IMAGE message. Metadata:\n' + JSON.stringify(message.animation));
    }
  }
  window.addEventListener('message', receiveMessage);

})();
