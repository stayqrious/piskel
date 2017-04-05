describe('PiskelApi test suite', function() {
	var piskelApi;
	beforeEach(function() {
		piskelApi = new PiskelApi();
	});

	afterEach(function() {
		piskelApi = null;
	})

	describe('attachToPiskel', function() {
		var iframe;
		beforeEach(function() {
			spyOn(window, 'addEventListener');
			iframe = createFakeIframe();
			piskelApi.attachToPiskel(iframe);
		})

		it('adds a listener to the window for messages', function() {
			expect(window.addEventListener.calls.count()).toBe(1);
			expect(window.addEventListener.calls.argsFor(0)[0]).toBe('message');
			expect(window.addEventListener.calls.argsFor(0)[1]).toBe(piskelApi.boundReceiveMessage_);
		});

		it('attaches the iframe', function() {
			expect(piskelApi.iframe_).toBe(iframe);
		})
	});

	describe('detachFromPiskel', function() {
		var iframe;
		beforeEach(function() {
			spyOn(window, 'removeEventListener');
			iframe = createFakeIframe();
			piskelApi.attachToPiskel(iframe);
			piskelApi.detachFromPiskel();
		})

		it('removes a listener to the window for messages', function() {
			expect(window.removeEventListener.calls.count()).toBe(1);
			expect(window.removeEventListener.calls.argsFor(0)[0]).toBe('message');
			expect(window.removeEventListener.calls.argsFor(0)[1]).toBe(piskelApi.boundReceiveMessage_);
		});

		it('detaches the iframe', function() {
			expect(piskelApi.iframe_).toBe(null);
		})
	});

	describe('createNewPiskel', function() {
		var iframe;
		beforeEach(function() {
			spyOn(piskelApi, 'callBackOnce_');
			iframe = createFakeIframe();
			piskelApi.attachToPiskel(iframe);
			piskelApi.createNewPiskel(150, 200, 8);
		});

		afterEach(function() {
			piskelApi.callBackOnce_.calls.reset();
		});

		it('adds an animation loaded callback', function() {
			expect(piskelApi.callBackOnce_.calls.count()).toBe(1);
			expect(piskelApi.callBackOnce_.calls.argsFor(0)[0]).toBe(PiskelApi.MessageType.ANIMATION_LOADED);
		});

		it('posts a message to the iframe', function() {
			expect(iframe.contentWindow.postMessage.calls.argsFor(0)[0].type).toBe(PiskelApi.MessageType.NEW_PISKEL);
			expect(iframe.contentWindow.postMessage.calls.argsFor(0)[0].frameSizeX).toBe(150);
			expect(iframe.contentWindow.postMessage.calls.argsFor(0)[0].frameSizeY).toBe(200);
			expect(iframe.contentWindow.postMessage.calls.argsFor(0)[0].frameRate).toBe(8);
		});
	});

	describe('loadSpritesheet', function() {
		var iframe;
		beforeEach(function() {
			spyOn(piskelApi, 'callBackOnce_');
			iframe = createFakeIframe();
			piskelApi.attachToPiskel(iframe);
			piskelApi.loadSpritesheet('uri_example', 150, 200, 8);
		});

		afterEach(function() {
			piskelApi.callBackOnce_.calls.reset();
		});

		it('adds an animation loaded callback', function() {
			expect(piskelApi.callBackOnce_.calls.count()).toBe(1);
			expect(piskelApi.callBackOnce_.calls.argsFor(0)[0]).toBe(PiskelApi.MessageType.ANIMATION_LOADED);
		});

		it('posts a message to the iframe', function() {
			expect(iframe.contentWindow.postMessage.calls.argsFor(0)[0].type).toBe(PiskelApi.MessageType.LOAD_SPRITESHEET);
			expect(iframe.contentWindow.postMessage.calls.argsFor(0)[0].uri).toBe('uri_example');
			expect(iframe.contentWindow.postMessage.calls.argsFor(0)[0].frameSizeX).toBe(150);
			expect(iframe.contentWindow.postMessage.calls.argsFor(0)[0].frameSizeY).toBe(200);
			expect(iframe.contentWindow.postMessage.calls.argsFor(0)[0].frameRate).toBe(8);
		});
	});

	describe('appendFrames', function() {
		var iframe;
		beforeEach(function() {
			spyOn(piskelApi, 'callBackOnce_');
			iframe = createFakeIframe();
			piskelApi.attachToPiskel(iframe);
			piskelApi.appendFrames('uri_example', 150, 200);
		});

		afterEach(function() {
			piskelApi.callBackOnce_.calls.reset();
		});

		it('adds an frames loaded callback', function() {
			expect(piskelApi.callBackOnce_.calls.count()).toBe(1);
			expect(piskelApi.callBackOnce_.calls.argsFor(0)[0]).toBe(PiskelApi.MessageType.FRAMES_LOADED);
		});

		it('posts a message to the iframe', function() {
			expect(iframe.contentWindow.postMessage.calls.argsFor(0)[0].type).toBe(PiskelApi.MessageType.APPEND_FRAMES);
			expect(iframe.contentWindow.postMessage.calls.argsFor(0)[0].uri).toBe('uri_example');
			expect(iframe.contentWindow.postMessage.calls.argsFor(0)[0].frameSizeX).toBe(150);
			expect(iframe.contentWindow.postMessage.calls.argsFor(0)[0].frameSizeY).toBe(200);
		});
	});

	describe('appendFrames', function() {
		var iframe;
		beforeEach(function() {
			iframe = createFakeIframe();
			piskelApi.attachToPiskel(iframe);
			piskelApi.addBlankFrame();
		});

		it('posts a message to the iframe', function() {
			expect(iframe.contentWindow.postMessage.calls.argsFor(0)[0].type).toBe(PiskelApi.MessageType.ADD_BLANK_FRAME);
		});
	});

	describe('toggleFrameColumn', function() {
		var iframe;
		beforeEach(function() {
			iframe = createFakeIframe();
			piskelApi.attachToPiskel(iframe);
		});

		it('toggles to true', function() {
			piskelApi.toggleFrameColumn(true);
			expect(iframe.contentWindow.postMessage.calls.argsFor(0)[0].type).toBe(PiskelApi.MessageType.TOGGLE_FRAME_COLUMN);
			expect(iframe.contentWindow.postMessage.calls.argsFor(0)[0].hideFrameColumn).toBe(true);
		});

		it('toggles to false', function() {
			piskelApi.toggleFrameColumn(false);
			expect(iframe.contentWindow.postMessage.calls.argsFor(0)[0].type).toBe(PiskelApi.MessageType.TOGGLE_FRAME_COLUMN);
			expect(iframe.contentWindow.postMessage.calls.argsFor(0)[0].hideFrameColumn).toBe(false);
		});
	});

	describe('onPiskelReady', function() {
		var iframe, callback;
		beforeEach(function() {
			spyOn(piskelApi, 'addCallback_');
			callback = function() {};
			piskelApi.onPiskelReady(callback);
		});

		afterEach(function() {
			piskelApi.addCallback_.calls.reset();
		});

		it('adds a piskel ready callback', function() {
			expect(piskelApi.addCallback_.calls.count()).toBe(1);
			expect(piskelApi.addCallback_.calls.argsFor(0)[0]).toBe(PiskelApi.MessageType.PISKEL_API_READY);
			expect(piskelApi.addCallback_.calls.argsFor(0)[1]).toBe(callback);
		});
	});

	describe('onStateSaved', function() {
		var iframe, callback;
		beforeEach(function() {
			spyOn(piskelApi, 'addCallback_');
			callback = function() {};
			piskelApi.onStateSaved(callback);
		});

		afterEach(function() {
			piskelApi.addCallback_.calls.reset();
		});

		it('adds a state saved callback', function() {
			expect(piskelApi.addCallback_.calls.count()).toBe(1);
			expect(piskelApi.addCallback_.calls.argsFor(0)[0]).toBe(PiskelApi.MessageType.STATE_SAVED);
			expect(piskelApi.addCallback_.calls.argsFor(0)[1]).toBe(callback);
		});
	});

	describe('onAddFrame', function() {
		var iframe, callback;
		beforeEach(function() {
			spyOn(piskelApi, 'addCallback_');
			callback = function() {};
			piskelApi.onAddFrame(callback);
		});

		afterEach(function() {
			piskelApi.addCallback_.calls.reset();
		});

		it('adds a frame add clicked callback', function() {
			expect(piskelApi.addCallback_.calls.count()).toBe(1);
			expect(piskelApi.addCallback_.calls.argsFor(0)[0]).toBe(PiskelApi.MessageType.ADD_NEW_FRAME_CLICKED);
			expect(piskelApi.addCallback_.calls.argsFor(0)[1]).toBe(callback);
		});
	});

	function createFakeIframe() {
		var iframe = {
			contentWindow: {
				postMessage: function() {}
			}
		}
		spyOn(iframe.contentWindow, 'postMessage');
		return iframe;
	}
})