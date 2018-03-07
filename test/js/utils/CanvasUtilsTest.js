describe("Canvas utils", function() {

  it("returns a single blank frame when provided a blank spritesheet set to ignore blank frames", function() {
    var width = 10;
    var height = 10;
    var blankData = pskl.utils.CanvasUtils.createCanvas(width, height).toDataURL();
    var blankImg = new Image(width, height);
    blankImg.src = blankData;

    var blankSpritesheetFrames = pskl.utils.CanvasUtils.createFramesFromImage(blankImg, 0, 0, width, height, true, true);

    expect(blankSpritesheetFrames.length).toBe(1);
    expect(blankSpritesheetFrames[0].toDataURL()).toBe(blankData);
  });
});