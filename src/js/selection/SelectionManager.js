(function () {
  var ns = $.namespace('pskl.selection');

  var SELECTION_REPLAY = {
    PASTE : 'REPLAY_PASTE',
    ERASE : 'REPLAY_ERASE'
  };

  ns.SelectionManager = function (piskelController) {

    this.piskelController = piskelController;

    this.currentSelection = null;
  };

  ns.SelectionManager.prototype.init = function () {
    $.subscribe(Events.SELECTION_CREATED, $.proxy(this.onSelectionCreated_, this));
    $.subscribe(Events.SELECTION_DISMISSED, $.proxy(this.onSelectionDismissed_, this));
    $.subscribe(Events.SELECTION_MOVE_REQUEST, $.proxy(this.onSelectionMoved_, this));
    $.subscribe(Events.SELECTION_COPY, this.copy.bind(this));
    $.subscribe(Events.SELECTION_CUT, this.cut.bind(this));
    $.subscribe(Events.SELECTION_PASTE, this.paste.bind(this));

    var shortcuts = pskl.service.keyboard.Shortcuts;
    pskl.app.shortcutService.registerShortcut(shortcuts.SELECTION.PASTE, this.paste.bind(this));
    pskl.app.shortcutService.registerShortcut(shortcuts.SELECTION.CUT, this.cut.bind(this));
    pskl.app.shortcutService.registerShortcut(shortcuts.SELECTION.COPY, this.copy.bind(this));
    pskl.app.shortcutService.registerShortcut(shortcuts.SELECTION.DELETE, this.onDeleteShortcut_.bind(this));
    pskl.app.shortcutService.registerShortcut(shortcuts.SELECTION.COMMIT, this.commit.bind(this));

    $.subscribe(Events.TOOL_SELECTED, $.proxy(this.onToolSelected_, this));
  };

  /**
   * @private
   */
  ns.SelectionManager.prototype.cleanSelection_ = function() {
    if (this.currentSelection) {
      this.currentSelection.reset();
      this.currentSelection = null;
    }
  };

  /**
   * @private
   */
  ns.SelectionManager.prototype.onToolSelected_ = function(evt, tool) {
    var isSelectionTool = tool instanceof pskl.tools.drawing.selection.BaseSelect;
    if (!isSelectionTool) {
      this.cleanSelection_();
    }
  };

  /**
   * @private
   */
  ns.SelectionManager.prototype.onSelectionDismissed_ = function(evt) {
    // On deselect, paste in place.
    this.paste();
    this.cleanSelection_();
  };

  ns.SelectionManager.prototype.onDeleteShortcut_ = function(evt) {
    if (this.currentSelection) {
      this.erase();
    } else {
      return true; // bubble
    }
  };

  ns.SelectionManager.prototype.erase = function () {
    var pixels = this.currentSelection.pixels;
    var currentFrame = this.piskelController.getCurrentFrame();
    for (var i = 0, l = pixels.length ; i < l ; i++) {
      currentFrame.setPixel(pixels[i].col, pixels[i].row, Constants.TRANSPARENT_COLOR);
    }

    $.publish(Events.PISKEL_SAVE_STATE, {
      type : pskl.service.HistoryService.REPLAY,
      scope : this,
      replay : {
        type : SELECTION_REPLAY.ERASE,
        pixels : JSON.parse(JSON.stringify(pixels.slice(0)))
      }
    });
  };

  ns.SelectionManager.prototype.cut = function() {
    if (this.currentSelection) {
      // Put cut target into the selection:
      this.currentSelection.fillSelectionFromFrame(this.piskelController.getCurrentFrame());
      this.erase();
    }
  };

  ns.SelectionManager.prototype._getBoundaryEdges = function(pixels) {
    var xCoordinate = 0;
    var yCoordinate = 0;
    for (var i = 0; i < pixels.length; i++) {
      if (xCoordinate < pixels[i].col) {
        xCoordinate = pixels[i].col;
      }
      if (yCoordinate < pixels[i].row) {
        yCoordinate = pixels[i].row;
      }
    };
    return {
      x: xCoordinate,
      y: yCoordinate
    };
  };

  ns.SelectionManager.prototype.paste = function(quickKey) {
    // Amount of pixels to offset the paste by.
    // When the paste is trigged by the quickKey Ctrl+V, offset the pasted overlay by 1.
    var offset = quickKey === 'V' ? 1 : 0;

    if (!this.currentSelection || !this.currentSelection.hasPastedContent) {
      return;
    }

    var pixels = this.currentSelection.pixels;
    var frame = this.piskelController.getCurrentFrame();

    this.pastePixels_(frame, pixels);

    // Offset the pasted selection from the original location.
    var tool = pskl.app.drawingController.currentToolBehavior;
    var isSelectionTool = tool instanceof pskl.tools.drawing.selection.BaseSelect;
    if (isSelectionTool) {
      var maxHeight = frame.height - 1;
      var maxWidth = frame.width - 1;
      var boundaryCoordinates = this._getBoundaryEdges(pixels);
      if (boundaryCoordinates.x < maxWidth) {
        this.currentSelection.move(offset, 0);
      }
      if (boundaryCoordinates.y < maxHeight) {
        this.currentSelection.move(0, offset);
      }

      var overlay = pskl.app.drawingController.overlayFrame;
      tool.reDraw(overlay);
    }

    // Save to state when selection is dropped in place.
    if (offset === 0) {
      $.publish(Events.PISKEL_SAVE_STATE, {
        type : pskl.service.HistoryService.REPLAY,
        scope : this,
        replay : {
          type : SELECTION_REPLAY.PASTE,
          pixels : JSON.parse(JSON.stringify(pixels.slice(0)))
        }
      });
    }
  };

  /**
   * If the currently selected tool is a selection tool, call commitSelection handler on
   * the current tool instance.
   */
  ns.SelectionManager.prototype.commit = function() {
    var tool = pskl.app.drawingController.currentToolBehavior;
    var isSelectionTool = tool instanceof pskl.tools.drawing.selection.BaseSelect;
    if (isSelectionTool) {
      var overlay = pskl.app.drawingController.overlayFrame;
      tool.commitSelection(overlay);
    }
  };

  ns.SelectionManager.prototype.replay = function (frame, replayData) {
    if (replayData.type === SELECTION_REPLAY.PASTE) {
      this.pastePixels_(frame, replayData.pixels);
    } else if (replayData.type === SELECTION_REPLAY.ERASE) {
      replayData.pixels.forEach(function (pixel) {
        frame.setPixel(pixel.col, pixel.row, Constants.TRANSPARENT_COLOR);
      });
    }
  };

  ns.SelectionManager.prototype.pastePixels_ = function(frame, pixels) {
    pixels.forEach(function (pixel) {
      if (pixel.color === Constants.TRANSPARENT_COLOR || pixel.color === null) {
        return;
      }
      frame.setPixel(pixel.col, pixel.row, pixel.color);
    });
  };

  ns.SelectionManager.prototype.copy = function() {
    if (this.currentSelection && this.piskelController.getCurrentFrame()) {
      this.currentSelection.fillSelectionFromFrame(this.piskelController.getCurrentFrame());
    }
  };

  /**
   * @private
   */
  ns.SelectionManager.prototype.onSelectionCreated_ = function(evt, selection) {
    if (selection) {
      this.currentSelection = selection;
    } else {
      console.error('No selection provided to SelectionManager');
    }
  };

  /**
   * @private
   */
  ns.SelectionManager.prototype.onSelectionMoved_ = function(evt, colDiff, rowDiff) {
    if (this.currentSelection) {
      this.currentSelection.move(colDiff, rowDiff);
    } else {
      console.error('Bad state: No currentSelection set when trying to move it in SelectionManager');
    }
  };
})();
