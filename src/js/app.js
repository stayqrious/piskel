/**
 * @require Constants
 * @require Events
 */
(function () {
  var ns = $.namespace('pskl');
  /**
   * Main application controller
   */
  ns.app = {

    init: function () {
      /**
        * Piskel supports Internalization(i18n) by providing translations of its UI elements.
        *
        * The available strings are in `i18n/locales` directory and each locale has its own file.
        * For example: `en_US.json` where `en` is English and `US` is United States
        * Note that en_US.json should contain all available strings because this is the locale other
        * languages will fallback to if a translation from English doesn't exist.
        *
        * The strings that we will be used depend on the window.piskel_locale. window.piskel_locale is
        * the 4 letter locale code defined by users of the Piskel library so they can optionally
        * load non-English strings into the Piskel UI. For example "en_us" or "es_es"
        *
        * window.piskel_locales will contains all strings available, then we will use window.piskel_locale
        * to select the language we want strings to be in. All of this is happening here:
        * var i18n = window.piskel_locales[window.piskel_locale];
        * In the case that window.piskel_locale is undefined, we set the strings to English by default
        *
        * Example Usage tools/drawing/SimplePen.js:
        * this.helpText = i18n.simplePenDrawingTool()
        * Now when the user hovers over the Pen tool, they will see the translation based on the locale
        * The i18n object is passed in the Controllers that have text to translate. For example
        * ToolController takes in the i18n object so that it can be used in all the Tools like Stroke and Pen Tool
        *
        * To see how each key becomes a function look at the tasks/build-i18n.js file where we use the MessageFormat API
      */

      if (window.piskel_locale === undefined) {
        window.piskel_locale = 'en_us';
      }
      var i18n = window.piskel_locales[window.piskel_locale.toLowerCase()];

      // Run preferences migration scripts for version v0.12.0
      pskl.UserSettings.migrate_to_v0_12();

      /**
       * When started from APP Engine, appEngineToken_ (Boolean) should be set on window.pskl
       */
      this.isAppEngineVersion = !!pskl.appEngineToken_;

      // This id is used to keep track of sessions in the BackupService.
      this.sessionId = pskl.utils.Uuid.generate();

      this.shortcutService = new pskl.service.keyboard.ShortcutService();
      this.shortcutService.init();

      var size = pskl.UserSettings.get(pskl.UserSettings.DEFAULT_SIZE);
      var fps = Constants.DEFAULT.FPS;
      var descriptor = new pskl.model.piskel.Descriptor('New Piskel', '');
      var piskel = new pskl.model.Piskel(size.width, size.height, fps, descriptor);

      var layer = new pskl.model.Layer('Layer 1');
      var frame = new pskl.model.Frame(size.width, size.height);

      layer.addFrame(frame);
      piskel.addLayer(layer);

      this.corePiskelController = new pskl.controller.piskel.PiskelController(piskel);
      this.corePiskelController.init();

      this.piskelController = new pskl.controller.piskel.PublicPiskelController(this.corePiskelController);
      this.piskelController.init();

      this.paletteImportService = new pskl.service.palette.PaletteImportService();
      this.paletteImportService.init();

      this.paletteService = new pskl.service.palette.PaletteService();
      this.paletteService.addDynamicPalette(new pskl.service.palette.CurrentColorsPalette());

      this.selectedColorsService = new pskl.service.SelectedColorsService();
      this.selectedColorsService.init();

      this.mouseStateService = new pskl.service.MouseStateService();
      this.mouseStateService.init();

      this.paletteController = new pskl.controller.PaletteController(i18n);
      this.paletteController.init();

      this.currentColorsService = new pskl.service.CurrentColorsService(this.piskelController);
      this.currentColorsService.init();

      this.palettesListController = new pskl.controller.PalettesListController(this.currentColorsService);
      this.palettesListController.init();

      this.cursorCoordinatesController = new pskl.controller.CursorCoordinatesController(this.piskelController);
      this.cursorCoordinatesController.init();

      this.drawingController = new pskl.controller.DrawingController(
        this.piskelController,
        $('#drawing-canvas-container'));
      this.drawingController.init();

      this.previewController = new pskl.controller.preview.PreviewController(
        this.piskelController,
        $('#animated-preview-canvas-container'),
        i18n);
      this.previewController.init();

      this.minimapController = new pskl.controller.MinimapController(
        this.piskelController,
        this.previewController,
        this.drawingController,
        $('.minimap-container'));
      this.minimapController.init();

      this.framesListController = new pskl.controller.FramesListController(
        this.piskelController,
        $('#preview-list-wrapper').get(0),
        i18n);
      this.framesListController.init();

      this.layersListController = new pskl.controller.LayersListController(this.piskelController);
      this.layersListController.init();

      this.settingsController = new pskl.controller.settings.SettingsController(this.piskelController, i18n);
      this.settingsController.init();

      this.dialogsController = new pskl.controller.dialogs.DialogsController(this.piskelController);
      this.dialogsController.init();

      this.toolController = new pskl.controller.ToolController(i18n);
      this.toolController.init();

      this.selectionManager = new pskl.selection.SelectionManager(this.piskelController);
      this.selectionManager.init();

      this.historyService = new pskl.service.HistoryService(this.piskelController);
      this.historyService.init();

      this.notificationController = new pskl.controller.NotificationController();
      this.notificationController.init();

      this.transformationsController = new pskl.controller.TransformationsController(i18n);
      this.transformationsController.init();

      this.progressBarController = new pskl.controller.ProgressBarController();
      this.progressBarController.init();

      this.canvasBackgroundController = new pskl.controller.CanvasBackgroundController();
      this.canvasBackgroundController.init();

      this.indexedDbStorageService = new pskl.service.storage.IndexedDbStorageService(this.piskelController);
      this.indexedDbStorageService.init();

      this.localStorageService = new pskl.service.storage.LocalStorageService(this.piskelController);
      this.localStorageService.init();

      this.fileDownloadStorageService = new pskl.service.storage.FileDownloadStorageService(this.piskelController);
      this.fileDownloadStorageService.init();

      this.desktopStorageService = new pskl.service.storage.DesktopStorageService(this.piskelController);
      this.desktopStorageService.init();

      this.galleryStorageService = new pskl.service.storage.GalleryStorageService(this.piskelController);
      this.galleryStorageService.init();

      this.storageService = new pskl.service.storage.StorageService(this.piskelController);
      this.storageService.init();

      this.importService = new pskl.service.ImportService(this.piskelController);
      this.importService.init();

      this.imageUploadService = new pskl.service.ImageUploadService();
      this.imageUploadService.init();

      this.savedStatusService = new pskl.service.SavedStatusService(
        this.piskelController,
        this.historyService);
      this.savedStatusService.init();

      this.backupService = new pskl.service.BackupService(this.piskelController);
      this.backupService.init();

      this.beforeUnloadService = new pskl.service.BeforeUnloadService(this.piskelController);
      this.beforeUnloadService.init();

      this.headerController = new pskl.controller.HeaderController(
        this.piskelController,
        this.savedStatusService);
      this.headerController.init();

      this.penSizeService = new pskl.service.pensize.PenSizeService();
      this.penSizeService.init();

      this.penSizeController = new pskl.controller.PenSizeController(i18n);
      this.penSizeController.init();

      this.fileDropperService = new pskl.service.FileDropperService(this.piskelController);
      this.fileDropperService.init();

      // Service that can interact with a parent application via the PiskelApi
      // class. See PiskelApi.js for more information.
      this.piskelApiService = new pskl.service.PiskelApiService(
          this.piskelController, this.previewController, this.importService);
      this.piskelApiService.init(window);

      this.clipboardService = new pskl.service.ClipboardService(this.piskelController);
      this.clipboardService.init();

      this.drawingLoop = new pskl.rendering.DrawingLoop();
      this.drawingLoop.addCallback(this.render, this);
      this.drawingLoop.start();

      this.initTooltips_();

      var piskelData = this.getPiskelInitData_();
      if (piskelData && piskelData.piskel) {
        this.loadPiskel_(piskelData);
      }

      if (pskl.devtools) {
        pskl.devtools.init();
      }

      if (pskl.utils.Environment.detectNodeWebkit() && pskl.utils.UserAgent.isMac) {
        var gui = require('nw.gui');
        var mb = new gui.Menu({type : 'menubar'});
        mb.createMacBuiltin('Piskel');
        gui.Window.get().menu = mb;
      }

      if (!pskl.utils.Environment.isIntegrationTest() && pskl.utils.UserAgent.isUnsupported()) {
        $.publish(Events.DIALOG_SHOW, {
          dialogId : 'unsupported-browser'
        });
      }

      if (pskl.utils.Environment.isDebug()) {
        pskl.app.shortcutService.registerShortcut(pskl.service.keyboard.Shortcuts.DEBUG.RELOAD_STYLES,
          window.reloadStyles);
      }
    },

    loadPiskel_ : function (piskelData) {
      var serializedPiskel = piskelData.piskel;
      pskl.utils.serialization.Deserializer.deserialize(serializedPiskel, function (piskel) {
        pskl.app.piskelController.setPiskel(piskel);
        $.publish(Events.PISKEL_SAVED);
        if (piskelData.descriptor) {
          // Backward compatibility for v2 or older
          piskel.setDescriptor(piskelData.descriptor);
        }
      });
    },

    getPiskelInitData_ : function () {
      return pskl.appEnginePiskelData_;
    },

    isLoggedIn : function () {
      var piskelData = this.getPiskelInitData_();
      return piskelData && piskelData.isLoggedIn;
    },

    initTooltips_ : function () {
      $('body').tooltip({
        selector: '[rel=tooltip]'
      });
    },

    render : function (delta) {
      this.drawingController.render(delta);
      this.previewController.render(delta);
      this.framesListController.render(delta);
    },

    getFirstFrameAsPng : function () {
      var frame = pskl.utils.LayerUtils.mergeFrameAt(this.piskelController.getLayers(), 0);
      var canvas;
      if (frame instanceof pskl.model.frame.RenderedFrame) {
        canvas = pskl.utils.CanvasUtils.createFromImage(frame.getRenderedFrame());
      } else {
        canvas = pskl.utils.FrameUtils.toImage(frame);
      }
      return canvas.toDataURL('image/png');
    },

    getFramesheetAsPng : function () {
      var renderer = new pskl.rendering.PiskelRenderer(this.piskelController);
      var framesheetCanvas = renderer.renderAsCanvas();
      return framesheetCanvas.toDataURL('image/png');
    }
  };
})();
