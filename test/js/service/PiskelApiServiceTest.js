//https://jasmine.github.io/1.3/introduction.html
describe("PiskelApiService test suite", function() {
  var piskelWindow;

  beforeEach(function() {
    piskelWindow = createFakePiskelWindow();
  });

  describe('init()', function() {
    var service;
    beforeEach(function() {
      service = new pskl.service.PiskelApiService();
      spyOn($, "subscribe");
      service.init(piskelWindow);
    });

    afterEach(function() {
      $.subscribe.calls.reset();
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
});
