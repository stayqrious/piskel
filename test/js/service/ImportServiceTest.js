
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

  var color = 'rgb(1, 1, 1)';

  it("mergePiskels combines two same size piskels", function() {
    var service = new pskl.service.ImportService();

    var piskel1 = createPiskel(10, 10, 2);
    var piskel2 = createPiskel(10, 10, 1);
    piskel1.layers[0].getFrameAt(0).setPixel(1, 1, color);
    piskel1.layers[0].getFrameAt(1).setPixel(1, 2, color);
    piskel2.layers[0].getFrameAt(0).setPixel(2, 1, color);
    var mergedPiskels = service.mergePiskels(piskel1, piskel2);
    
    // Check that sizes are the same.
    expect(mergedPiskels.layers[0].size()).toBe(3);
    expect(mergedPiskels.width).toBe(10);
    expect(mergedPiskels.height).toBe(10);
    mergedPiskels.layers[0].frames.forEach(function (frame) {
      expect(frame.width).toBe(10);
      expect(frame.height).toBe(10);
    });

    // Check that frames are in the right order and pixels are in the right place.
    expect(mergedPiskels.layers[0].getFrameAt(0).getPixel(1,1)).toBe(color);
    expect(mergedPiskels.layers[0].getFrameAt(1).getPixel(1,2)).toBe(color);
    expect(mergedPiskels.layers[0].getFrameAt(2).getPixel(2,1)).toBe(color);
  });

  it("mergePiskels combines two different size piskels", function() {
    var service = new pskl.service.ImportService();

    // PISKELS 1 AND 2
    var piskel1 = createPiskel(10, 10, 1);
    var piskel2 = createPiskel(20, 20, 3);
    piskel1.layers[0].getFrameAt(0).setPixel(1, 1, color);
    piskel2.layers[0].getFrameAt(0).setPixel(1, 2, color);
    piskel2.layers[0].getFrameAt(1).setPixel(2, 1, color);
    piskel2.layers[0].getFrameAt(2).setPixel(2, 2, color);
    var mergedPiskels = service.mergePiskels(piskel1, piskel2);

    // Check that sizes are the same.
    expect(mergedPiskels.layers[0].size()).toBe(4);
    expect(mergedPiskels.width).toBe(20);
    expect(mergedPiskels.height).toBe(20);
    mergedPiskels.layers[0].frames.forEach(function (frame) {
      expect(frame.width).toBe(20);
      expect(frame.height).toBe(20);
    });

    // Check that frames are in the right order and pixels are in the right place.
    expect(mergedPiskels.layers[0].getFrameAt(0).getPixel(6,6)).toBe(color);
    expect(mergedPiskels.layers[0].getFrameAt(1).getPixel(1,2)).toBe(color);
    expect(mergedPiskels.layers[0].getFrameAt(2).getPixel(2,1)).toBe(color);
    expect(mergedPiskels.layers[0].getFrameAt(3).getPixel(2,2)).toBe(color);

    // PISKELS 3 AND 4
    var piskel3 = createPiskel(20, 20, 3);
    var piskel4 = createPiskel(10, 10, 1);
    piskel3.layers[0].getFrameAt(0).setPixel(2, 2, color);
    piskel3.layers[0].getFrameAt(1).setPixel(3, 3, color);
    piskel3.layers[0].getFrameAt(2).setPixel(4, 4, color);
    piskel4.layers[0].getFrameAt(0).setPixel(5, 5, color);
    var mergedPiskels2 = service.mergePiskels(piskel3, piskel4);

    // Check that sizes are the same.
    expect(mergedPiskels2.layers[0].size()).toBe(4);
    expect(mergedPiskels2.width).toBe(20);
    expect(mergedPiskels2.height).toBe(20);
    mergedPiskels2.layers[0].frames.forEach(function (frame) {
      expect(frame.width).toBe(20);
      expect(frame.height).toBe(20);
    });

    // Check that frames are in the right order and pixels are in the right place.
    expect(mergedPiskels2.layers[0].getFrameAt(0).getPixel(2,2)).toBe(color);
    expect(mergedPiskels2.layers[0].getFrameAt(1).getPixel(3,3)).toBe(color);
    expect(mergedPiskels2.layers[0].getFrameAt(2).getPixel(4,4)).toBe(color);
    expect(mergedPiskels2.layers[0].getFrameAt(3).getPixel(10,10)).toBe(color);

    // PISKELS 5 AND 6
    var piskel5 = createPiskel(30, 20, 2);
    var piskel6 = createPiskel(10, 40, 2);
    piskel5.layers[0].getFrameAt(0).setPixel(2, 2, color);
    piskel5.layers[0].getFrameAt(1).setPixel(3, 3, color);
    piskel6.layers[0].getFrameAt(0).setPixel(4, 4, color);
    piskel6.layers[0].getFrameAt(1).setPixel(5, 5, color);
    var mergedPiskels3 = service.mergePiskels(piskel5, piskel6);

    // Check that sizes are the same.
    expect(mergedPiskels3.layers[0].size()).toBe(4);
    expect(mergedPiskels3.width).toBe(30);
    expect(mergedPiskels3.height).toBe(40);
    mergedPiskels3.layers[0].frames.forEach(function (frame) {
      expect(frame.width).toBe(30);
      expect(frame.height).toBe(40);
    });

    // Check that frames are in the right order and pixels are in the right place.
    expect(mergedPiskels3.layers[0].getFrameAt(0).getPixel(2,12)).toBe(color);
    expect(mergedPiskels3.layers[0].getFrameAt(1).getPixel(3,13)).toBe(color);
    expect(mergedPiskels3.layers[0].getFrameAt(2).getPixel(14,4)).toBe(color);
    expect(mergedPiskels3.layers[0].getFrameAt(3).getPixel(15,5)).toBe(color);
  });
});
