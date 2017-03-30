
describe("PiskelApiService test suite", function() {
  var piskelWindow;

  beforeEach(function() {
    piskelWindow = createFakePiskelWindow();
  });

  describe('init()', function() {
    var service;
    beforeEach(function() {
      service = new pskl.service.PiskelApiService();
      sinon.stub($, "subscribe");
      service.init(piskelWindow);
    });

    afterEach(function() {
      $.subscribe.restore();
    });

    it("sends a PISKEL_API_READY message to the parent window", function() {
      expect(piskelWindow.parent.postMessage.callCount).toBe(1);
      expect(piskelWindow.parent.postMessage.getCall(0).args[0].type).toBe(PiskelApi.MessageType.PISKEL_API_READY);
    });

    it("adds an event listener on its own window", function() {
      expect(piskelWindow.addEventListener.calledOnce).toBe(true);
    });

    it("subscribes to events", function() {
      expect($.subscribe.callCount).toBe(5);
      expect($.subscribe.args[0][0]).toBe(Events.PISKEL_SAVE_STATE);
      expect($.subscribe.args[1][0]).toBe(Events.FPS_CHANGED);
      expect($.subscribe.args[2][0]).toBe(Events.HISTORY_STATE_LOADED);
      expect($.subscribe.args[3][0]).toBe(Events.FRAME_SIZE_CHANGED);
      expect($.subscribe.args[4][0]).toBe(Events.ADD_NEW_FRAME_CLICKED);
    });
  });

  function createFakePiskelWindow() {
    return {
        parent: {
          postMessage: sinon.spy(),
        },
        location: {
          origin: ''
        },
        addEventListener: sinon.spy()
      };
  }
});
