/* globals casper, setPiskelFromGrid, isDrawerExpanded, getValue, isChecked, evalLine */

casper.test.begin('Test resize panel width/height inputs are synchronized', 28 , function(test) {
  test.timeout = test.fail.bind(test, ['Test timed out']);

  function onTestStart() {
    test.assertExists('#drawing-canvas-container canvas', 'Piskel ready, test starting');

    test.assert(!isDrawerExpanded(), 'settings drawer is closed');
    test.assertDoesntExist('.settings-section-resize', 'Check if resize settings drawer is closed');

    // Open resize panel.
    this.click('[data-setting="resize"]');
    this.waitForSelector('.settings-section-resize', onResizePanelReady, test.timeout, 10000);
  }

  function onResizePanelReady() {
    test.assert(isDrawerExpanded(), 'settings drawer is expanded');
    test.assertExists('.settings-section-resize', 'Check if resize panel is opened');

    testInputSynchronization();
  }

  function testInputSynchronization() {
    test.assertExists('[name="resize-width"]', 'Check if width input is available');
    test.assertExists('[name="resize-height"]', 'Check if height input is available');

    test.assertEquals(getValue('[name="resize-width"]'), "256", 'Resize width is 256px');
    test.assertEquals(getValue('[name="resize-height"]'), "256", 'Resize height is 256px');

    // Check that the resize ratio checkbox is available and checked.
    test.assertExists('.resize-ratio-checkbox', 'Check if resize ratio checkbox is available');
    test.assert(casper.evaluate(function () {
      return document.querySelector('.resize-ratio-checkbox').checked;
    }), 'Keep ratio checkbox is checked');

    // Check inputs are synchronized
    casper.sendKeys('[name="resize-width"]', casper.page.event.key.Backspace);
    test.assertEquals(getValue('[name="resize-width"]'), "25", 'Resize width is 25px');
    test.assertEquals(getValue('[name="resize-height"]'), "25", 'Resize height is 25px');

    casper.sendKeys('[name="resize-width"]', "0");
    test.assertEquals(getValue('[name="resize-width"]'), "250", 'Resize width is 250px');
    test.assertEquals(getValue('[name="resize-height"]'), "250", 'Resize height is 250px');

    // Check the synchronization also works when editing height field
    casper.sendKeys('[name="resize-height"]', "0");
    test.assertEquals(getValue('[name="resize-width"]'), "2500", 'Resize width is 2500px');
    test.assertEquals(getValue('[name="resize-height"]'), "2500", 'Resize height is 2500px');

    casper.sendKeys('[name="resize-height"]', casper.page.event.key.Backspace);
    test.assertEquals(getValue('[name="resize-width"]'), "250", 'Resize width is 250px');
    test.assertEquals(getValue('[name="resize-height"]'), "250", 'Resize height is 250px');

    // Uncheck the resize ratio checkbox.
    casper.click('.resize-ratio-checkbox');

    // Check inputs are no longer synchronized
    casper.sendKeys('[name="resize-width"]', casper.page.event.key.Backspace);
    test.assertEquals(getValue('[name="resize-width"]'), "25", 'Resize width is 25px');
    test.assertEquals(getValue('[name="resize-height"]'), "250", 'Resize height is 250px');

    casper.sendKeys('[name="resize-width"]', "2");
    test.assertEquals(getValue('[name="resize-width"]'), "252", 'Resize width is 252px');
    test.assertEquals(getValue('[name="resize-height"]'), "250", 'Resize height is 250px');

    casper.sendKeys('[name="resize-height"]', casper.page.event.key.Backspace);
    test.assertEquals(getValue('[name="resize-width"]'), "252", 'Resize width is 252px');
    test.assertEquals(getValue('[name="resize-height"]'), "25", 'Resize height is 25px');

    casper.sendKeys('[name="resize-height"]', "2");
    test.assertEquals(getValue('[name="resize-width"]'), "252", 'Resize width is 252px');
    test.assertEquals(getValue('[name="resize-height"]'), "252", 'Resize height is 252px');

    // Check the resize ratio checkbox again
    casper.click('.resize-ratio-checkbox');

    // Send ESCAPE to close the resize panel. (!!! does not work for some reason ...)
    // casper.page.sendEvent('keydown', casper.page.event.key.Escape);
    casper.click('[data-setting="resize"]');
    casper.waitForSelector('[data-pskl-controller="settings"]:not(.expanded)', onDrawerClosed, test.timeout, 10000);
  }

  function onDrawerClosed() {
    test.assert(!isDrawerExpanded(), 'settings drawer is closed');
  }

  casper
    .start(casper.cli.get('baseUrl')+"/?debug")
    .then(function () {
      this.echo("URL loaded");
      this.waitForSelector('#drawing-canvas-container canvas', onTestStart, test.timeout, 20000);
    })
    .run(function () {
      test.done();
    });
});
