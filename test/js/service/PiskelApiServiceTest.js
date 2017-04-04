describe("PiskelApiService test suite", function() {
  var piskelWindow;

  beforeEach(function() {
    piskelWindow = createFakePiskelWindow();
  });

  afterEach(function() {
    piskelWindow.parent.postMessage.calls.reset();
    piskelWindow.addEventListener.calls.reset();
  })

  describe('init()', function() {
    var service, subscribeSpy;
    beforeEach(function() {
      service = new pskl.service.PiskelApiService();
      subscribeSpy = spyOn($, "subscribe");
      service.init(piskelWindow);
    });

    afterEach(function() {
      $.subscribe.calls.reset();
      subscribeSpy.and.callThrough();
    });

    it("sends a PISKEL_API_READY message to the parent window", function() {
      expect(piskelWindow.parent.postMessage.calls.count()).toEqual(1);
      expect(piskelWindow.parent.postMessage.calls.argsFor(0)[0].type).toBe(PiskelApi.MessageType.PISKEL_API_READY);
    });

    it("adds an event listener on its own window", function() {
      expect(piskelWindow.addEventListener.calls.count()).toEqual(1);
    });

    it("subscribes to events", function() {
      expect($.subscribe.calls.count()).toEqual(5);
      expect($.subscribe.calls.argsFor(0)[0]).toBe(Events.PISKEL_SAVE_STATE);
      expect($.subscribe.calls.argsFor(1)[0]).toBe(Events.FPS_CHANGED);
      expect($.subscribe.calls.argsFor(2)[0]).toBe(Events.HISTORY_STATE_LOADED);
      expect($.subscribe.calls.argsFor(3)[0]).toBe(Events.FRAME_SIZE_CHANGED);
      expect($.subscribe.calls.argsFor(4)[0]).toBe(Events.ADD_NEW_FRAME_CLICKED);
    });
  });

  describe('createNewPiskel()', function() {
    var service, piskelController;
    beforeEach(function() {
      piskelController = createFakePiskelController();
      service = new pskl.service.PiskelApiService(piskelController);
      service.init(piskelWindow);
    });

    afterEach(function() {
      piskelController.setPiskel.calls.reset();
    });

    it("sends an ANIMATION_LOADED message once creating a new piskel", function() {
      service.createNewPiskel(100, 100, 4);
      // One message for init and one message for create new.
      expect(piskelWindow.parent.postMessage.calls.count()).toEqual(2);
      expect(piskelWindow.parent.postMessage.calls.argsFor(1)[0].type).toBe(PiskelApi.MessageType.ANIMATION_LOADED);
    });

    it("sets a new piskel with a single frame and layer", function() {
      service.createNewPiskel(100, 100, 4);
      expect(piskelController.setPiskel.calls.count()).toBe(1);
      expect(piskelController.setPiskel.calls.argsFor(0)[0].width).toBe(100);
      expect(piskelController.setPiskel.calls.argsFor(0)[0].height).toBe(100);
      expect(piskelController.setPiskel.calls.argsFor(0)[0].fps).toBe(4);
      expect(piskelController.setPiskel.calls.argsFor(0)[0].descriptor.name).toBe('New Piskel');
      expect(piskelController.setPiskel.calls.argsFor(0)[0].layers.length).toBe(1);
      expect(piskelController.setPiskel.calls.argsFor(0)[0].layers[0].frames.length).toBe(1);
    })
  });

  describe('loadSpritesheet()', function() {
    var service, piskelController, importService, imageObject, onePixelBlackURI, imageSpy;

    beforeEach(function() {
      piskelController = createFakePiskelController();
      importService = createFakeImportService();
      service = new pskl.service.PiskelApiService(piskelController, {}, importService);
      service.init(piskelWindow);

      imageSpy = spyOn(window, "Image").and.callFake(function() {
        imageObject = this;
        this.onload = function() {};
        spyOn(imageObject, 'onload');
      });

      onePixelBlackURI = "image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGNiAAAABgADNjd8qAAAAABJRU5ErkJggg==";
    });

    afterEach(function() {
      piskelController.setPiskel.calls.reset();
      importService.importFramesFromImage.calls.reset();
      window.Image.calls.reset();
      imageSpy.and.callThrough();
    });

    it("calls the import service once the image has loaded", function() {
      service.loadSpritesheet(onePixelBlackURI, 100, 100, 4);
      expect(importService.newPiskelFromImage.calls.count()).toBe(0);
      imageObject.onload();
      expect(importService.newPiskelFromImage.calls.count()).toBe(1);
      expect(importService.newPiskelFromImage.calls.argsFor(0)[1].importType).toBe('spritesheet');
      expect(importService.newPiskelFromImage.calls.argsFor(0)[1].frameOffsetX).toBe(0);
      expect(importService.newPiskelFromImage.calls.argsFor(0)[1].frameOffsetY).toBe(0);
      expect(importService.newPiskelFromImage.calls.argsFor(0)[1].frameSizeX).toBe(100);
      expect(importService.newPiskelFromImage.calls.argsFor(0)[1].frameSizeY).toBe(100);
      expect(importService.newPiskelFromImage.calls.argsFor(0)[1].frameRate).toBe(4);
    });
  });

  describe('appendFrames()', function() {
    var service, piskelController, importService, imageObject, imageSpy, onePixelBlackURI;
    beforeEach(function() {
      piskelController = createFakePiskelController();
      importService = createFakeImportService();
      service = new pskl.service.PiskelApiService(piskelController, {}, importService);
      service.init(piskelWindow);

      imageSpy = spyOn(window, "Image").and.callFake(function() {
        imageObject = this;
        this.onload = function() {};
        spyOn(imageObject, 'onload');
      });

      onePixelBlackURI = "image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGNiAAAABgADNjd8qAAAAABJRU5ErkJggg==";
    });

    afterEach(function() {
      piskelController.setPiskel.calls.reset();
      importService.importFramesFromImage.calls.reset();
      window.Image.calls.reset();
      imageSpy.and.callThrough();
    });

    it("calls the import service once the image has loaded", function() {
      service.createNewPiskel(100, 100, 4);
      service.appendFrames(onePixelBlackURI, 100, 100);
      imageObject.onload();
      expect(importService.importFramesFromImage.calls.count()).toBe(1);
      expect(importService.importFramesFromImage.calls.argsFor(0)[1].importType).toBe('spritesheet');
      expect(importService.importFramesFromImage.calls.argsFor(0)[1].frameOffsetX).toBe(0);
      expect(importService.importFramesFromImage.calls.argsFor(0)[1].frameOffsetY).toBe(0);
      expect(importService.importFramesFromImage.calls.argsFor(0)[1].frameSizeX).toBe(100);
      expect(importService.importFramesFromImage.calls.argsFor(0)[1].frameSizeY).toBe(100);
    });
  });

  describe('toggleFrameColumn()', function() {
    var service, piskelController, styleObject, documentSpy;
    beforeEach(function() {
      piskelController = createFakePiskelController();
      service = new pskl.service.PiskelApiService(piskelController);
      service.init(piskelWindow);
      styleObject = {display: ''};
      documentSpy = spyOn(document, 'getElementById').and.callFake(function(id) {
        return {
          style: styleObject
        };
      });
    });

    afterEach(function() {
      document.getElementById.calls.reset();
      documentSpy.and.callThrough();
      piskelController.setPiskel.calls.reset();
    });

    it("toggles the frame to true", function() {
      service.toggleFrameColumn(true);
      expect(document.getElementById('preview-list-wrapper').style.display).toBe('none');
    });

    it("toggles the frame to false", function() {
      service.toggleFrameColumn(false);
      expect(document.getElementById('preview-list-wrapper').style.display).toBe('unset');
    });
  });

  describe('onSaveStateEvent()', function() {
    var service, piskelController, rendererSpy;
    beforeEach(function() {
      piskelController = createFakePiskelController();

      rendererSpy = spyOn(pskl.rendering.PiskelRenderer.prototype, 'renderAsCanvas').and.callFake(function() {
        return {
          toDataURL: function() {return 'url';}
        };
      });

      service = new pskl.service.PiskelApiService(piskelController);
      service.init(piskelWindow);
    });

    afterEach(function() {
      piskelController.setPiskel.calls.reset();
      piskelWindow.parent.postMessage.calls.reset();
      pskl.rendering.PiskelRenderer.prototype.renderAsCanvas.calls.reset();
      rendererSpy.and.callThrough();
    });

    it("sends a STATE_SAVED message", function() {
      service.createNewPiskel(100, 100, 4);
      service.onSaveStateEvent();
      // Messages for init, create new piskel, and a save event.
      expect(piskelWindow.parent.postMessage.calls.count()).toEqual(3);
      expect(piskelWindow.parent.postMessage.calls.argsFor(2)[0].type).toBe(PiskelApi.MessageType.STATE_SAVED);
    });

    it("sends a message with correct piskel data", function() {
      service.createNewPiskel(100, 100, 4);
      service.onSaveStateEvent();
      expect(piskelWindow.parent.postMessage.calls.argsFor(2)[0].frameSizeX).toBe(100);
      expect(piskelWindow.parent.postMessage.calls.argsFor(2)[0].frameSizeY).toBe(100);
      expect(piskelWindow.parent.postMessage.calls.argsFor(2)[0].frameCount).toBe(1);
      expect(piskelWindow.parent.postMessage.calls.argsFor(2)[0].frameRate).toBe(4);
      expect(piskelWindow.parent.postMessage.calls.argsFor(2)[0].dataURI).toBe('url');
    });
  });

  describe('onAddNewFrameEvent()', function() {
    var service, piskelController;
    beforeEach(function() {
      piskelController = createFakePiskelController();
      service = new pskl.service.PiskelApiService(piskelController);
      service.init(piskelWindow);
    });

    afterEach(function() {
      piskelWindow.parent.postMessage.calls.reset();
    })

    it("sends a ADD_NEW_FRAME_CLICKED event to the parent window", function() {
      service.onAddNewFrameEvent();
      // First call is for init, second call is for the event.
      expect(piskelWindow.parent.postMessage.calls.count()).toEqual(2);
      expect(piskelWindow.parent.postMessage.calls.argsFor(1)[0].type).toBe(PiskelApi.MessageType.ADD_NEW_FRAME_CLICKED);
    });
  });

  function createFakePiskelWindow() {
    var piskelWindow = {
      parent: {
        postMessage: function() {},
      },
      location: {
        origin: ''
      },
      addEventListener: function() {}
    };
    spyOn(piskelWindow.parent, 'postMessage');
    spyOn(piskelWindow, 'addEventListener');
    return piskelWindow;
  }

  function createFakePiskelController() {
    var piskelController = {
      setPiskel: function(newPiskel) {},
      renderFrameAt: function() {},
      getFrameCount: function() { return 1; },
      getWidth: function() { return 100; },
      getHeight: function() { return 100; },
      getFPS: function() { return 4; }
    };
    spyOn(piskelController, 'setPiskel');
    return piskelController;
  }

  function createFakeImportService() {
    var importService = {
      importFramesFromImage: function() {},
      newPiskelFromImage: function() {}
    };
    spyOn(importService, 'importFramesFromImage');
    spyOn(importService, 'newPiskelFromImage');
    return importService;
  }
});
