describe("Canvas utils", function() {

  it("returns a single blank frame when provided a small blank spritesheet set to ignore blank frames", function() {
    var imageSize = 10;
    var blankData = pskl.utils.CanvasUtils.createCanvas(imageSize, imageSize).toDataURL();
    var blankImg = new Image(imageSize, imageSize);
    blankImg.src = blankData;

    var blankSpritesheetFrames = pskl.utils.CanvasUtils.createFramesFromImage(blankImg, 0, 0, imageSize, imageSize, true, true);

    expect(blankSpritesheetFrames.length).toBe(1);
    expect(blankSpritesheetFrames[0].toDataURL()).toBe(blankData);
  });

  it("returns a single blank frame when provided a large blank spritesheet set to ignore blank frames", function() {
    var imageSize = 50;
    var frameSize = 10;
    var blankData = pskl.utils.CanvasUtils.createCanvas(imageSize, imageSize).toDataURL();
    var blankImg = new Image(imageSize, imageSize);
    blankImg.src = blankData;

    var blankSpritesheetFrames = pskl.utils.CanvasUtils.createFramesFromImage(blankImg, 0, 0, frameSize, frameSize, true, true);

    expect(blankSpritesheetFrames.length).toBe(1);
    expect(blankSpritesheetFrames[0].width).toBe(frameSize);
    expect(blankSpritesheetFrames[0].height).toBe(frameSize);
  });
});