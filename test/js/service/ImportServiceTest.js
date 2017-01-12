
describe("ImportService test suite", function() {
  var createPiskel = function(width, height, numFrames) {
    var descriptor = 10;
    var piskel = new pskl.model.Piskel(width, height, descriptor);
    var layer = new pskl.model.Layer("layer 1");
    for (var i = 0; i < numFrames; i++) {
      var frame = new pskl.model.Frame(width, height);
      layer.addFrame(frame);
    }
    piskel.addLayer(layer);
    return piskel;
  };

  it("mergePiskels combines two same size piskels", function() {
    var service = new pskl.service.ImportService();

    var piskel1 = createPiskel(10, 10, 2);
    var piskel2 = createPiskel(10, 10, 1);
    var mergedPiskels = service.mergePiskels(piskel1, piskel2);

    expect(mergedPiskels.layers[0].size()).toBe(3);
    expect(mergedPiskels.width).toBe(10);
    expect(mergedPiskels.height).toBe(10);
    expect(mergedPiskels.layers[0].getFrameAt(0).width).toBe(10);
    expect(mergedPiskels.layers[0].getFrameAt(1).width).toBe(10);
    expect(mergedPiskels.layers[0].getFrameAt(2).width).toBe(10);
    expect(mergedPiskels.layers[0].getFrameAt(0).height).toBe(10);
    expect(mergedPiskels.layers[0].getFrameAt(1).height).toBe(10);
    expect(mergedPiskels.layers[0].getFrameAt(2).height).toBe(10);
  });

  it("mergePiskels combines two different size piskels", function() {
    var service = new pskl.service.ImportService();

    var piskel1 = createPiskel(10, 10, 1);
    var piskel2 = createPiskel(20, 20, 3);
    var mergedPiskels = service.mergePiskels(piskel1, piskel2);

    expect(mergedPiskels.layers[0].size()).toBe(4);
    expect(mergedPiskels.width).toBe(20);
    expect(mergedPiskels.height).toBe(20);
    expect(mergedPiskels.layers[0].getFrameAt(0).width).toBe(20);
    expect(mergedPiskels.layers[0].getFrameAt(1).width).toBe(20);
    expect(mergedPiskels.layers[0].getFrameAt(2).width).toBe(20);
    expect(mergedPiskels.layers[0].getFrameAt(3).width).toBe(20);
    expect(mergedPiskels.layers[0].getFrameAt(0).height).toBe(20);
    expect(mergedPiskels.layers[0].getFrameAt(1).height).toBe(20);
    expect(mergedPiskels.layers[0].getFrameAt(2).height).toBe(20);
    expect(mergedPiskels.layers[0].getFrameAt(3).height).toBe(20);

    var piskel3 = createPiskel(20, 20, 3);
    var piskel4 = createPiskel(10, 10, 1);
    var mergedPiskels2 = service.mergePiskels(piskel3, piskel4);

    expect(mergedPiskels2.layers[0].size()).toBe(4);
    expect(mergedPiskels2.width).toBe(20);
    expect(mergedPiskels2.height).toBe(20);
    expect(mergedPiskels2.layers[0].getFrameAt(0).width).toBe(20);
    expect(mergedPiskels2.layers[0].getFrameAt(1).width).toBe(20);
    expect(mergedPiskels2.layers[0].getFrameAt(2).width).toBe(20);
    expect(mergedPiskels2.layers[0].getFrameAt(3).width).toBe(20);
    expect(mergedPiskels2.layers[0].getFrameAt(0).height).toBe(20);
    expect(mergedPiskels2.layers[0].getFrameAt(1).height).toBe(20);
    expect(mergedPiskels2.layers[0].getFrameAt(2).height).toBe(20);
    expect(mergedPiskels2.layers[0].getFrameAt(3).height).toBe(20);

    var piskel5 = createPiskel(30, 20, 2);
    var piskel6 = createPiskel(10, 40, 2);
    var mergedPiskels3 = service.mergePiskels(piskel5, piskel6);

    expect(mergedPiskels3.layers[0].size()).toBe(4);
    expect(mergedPiskels3.width).toBe(30);
    expect(mergedPiskels3.height).toBe(40);
    expect(mergedPiskels3.layers[0].getFrameAt(0).width).toBe(30);
    expect(mergedPiskels3.layers[0].getFrameAt(1).width).toBe(30);
    expect(mergedPiskels3.layers[0].getFrameAt(2).width).toBe(30);
    expect(mergedPiskels3.layers[0].getFrameAt(3).width).toBe(30);
    expect(mergedPiskels3.layers[0].getFrameAt(0).height).toBe(40);
    expect(mergedPiskels3.layers[0].getFrameAt(1).height).toBe(40);
    expect(mergedPiskels3.layers[0].getFrameAt(2).height).toBe(40);
    expect(mergedPiskels3.layers[0].getFrameAt(3).height).toBe(40);
  });
});
