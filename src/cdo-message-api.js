(function () {

  /**
   * Main entry point for messages received from outside the iframe.  This method
   * is effectively a router for incoming commands.
   * @param event
   */
  function receiveMessage(event) {
    // Ignore messages not sent from the same origin - embedded Piskel should be
    // loaded on the same domain as its parent frame.
    var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
    if (origin !== location.origin) {
      return;
    }

    var message = event.data;
    if (message.type === 'LOAD_IMAGE') {
      loadAnimation(message.animation);
    }
  }
  window.addEventListener('message', receiveMessage);

  var currentMetadata;

  function loadAnimation(animationMetadata) {
    currentMetadata = animationMetadata;
    readImageUrl(animationMetadata.sourceUrl, onImageLoaded);
  }

  function readImageUrl(url, callback) {
    var image = new Image();
    image.onload = callback.bind(null, image);
    image.src = url;
  }

  function onImageLoaded(image) {
    // FIXME : We remove the onload callback here because JsGif will insert
    // the image again and we want to avoid retriggering the image onload
    image.onload = function () {};
    importImageToPiskel(image);
  }

  function importImageToPiskel(image) {
    if (!image) {
      return;
    }

    var gifLoader = new window.SuperGif({
      gif : image
    });

    gifLoader.load({
      success: function () {
        var images = gifLoader.getFrames().map(function (frame) {
          return pskl.utils.CanvasUtils.createFromImageData(frame.data);
        });
        // Spritesheet
        createImagesFromSheet(images[0]);
      }.bind(this),
      error: function () {
        // Spritesheet
        createImagesFromSheet(image);
      }.bind(this)
    });
  }

  function createImagesFromSheet(image) {

    var x = 0;
    var y = 0;
    var w = currentMetadata.frameSize.x;
    var h = currentMetadata.frameSize.y;

    var images = pskl.utils.CanvasUtils.createFramesFromImage(
        image,
        x,
        y,
        w,
        h,
        /*useHorizonalStrips=*/ true,
        /*ignoreEmptyFrames=*/ true);
    createPiskelFromImages(images, w, h);
  }

  function createPiskelFromImages(images, w, h) {
    var frames = createFramesFromImages(images, w, h);
    var layer = pskl.model.Layer.fromFrames('Layer 1', frames);
    var descriptor = new pskl.model.piskel.Descriptor('Imported piskel', '');
    var piskel = pskl.model.Piskel.fromLayers([layer], descriptor);

    pskl.app.piskelController.setPiskel(piskel);
    pskl.app.previewController.setFPS(Constants.DEFAULT.FPS);
  }

  function createFramesFromImages(images, w, h) {
    var smoothing = true;
    return images.map(function (image) {
      var resizedImage = pskl.utils.ImageResizer.resize(image, w, h, smoothing);
      return pskl.utils.FrameUtils.createFromImage(resizedImage);
    });
  }

})();
