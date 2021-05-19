(function () {
  var ns = $.namespace('pskl.controller.settings');

  var settings = {
    'user' : {
      template : 'templates/settings/preferences.html',
      controller : ns.PreferencesController
    },
    'resize' : {
      template : 'templates/settings/resize.html',
      controller : ns.resize.ResizeController
    },
    'export' : {
      template : 'templates/settings/export.html',
      controller : ns.exportimage.ExportController
    },
    'import' : {
      template : 'templates/settings/import.html',
      controller : ns.ImportController
    },
    'localstorage' : {
      template : 'templates/settings/localstorage.html',
      controller : ns.LocalStorageController
    },
    'save' : {
      template : 'templates/settings/save.html',
      controller : ns.SaveController
    }
  };
  var i18n;

  var SEL_SETTING_CLS = 'has-expanded-drawer';
  var EXP_DRAWER_CLS = 'expanded';

  ns.SettingsController = function (piskelController) {
    this.piskelController = piskelController;
    this.closeDrawerShortcut = pskl.service.keyboard.Shortcuts.MISC.CLOSE_POPUP;
    this.settingsContainer = document.querySelector('[data-pskl-controller=settings]');
    this.drawerContainer = document.getElementById('drawer-container');
    this.isExpanded = false;
    this.currentSetting = null;
  };

  /**
   * @public
   */
  ns.SettingsController.prototype.init = function (i18nPassed) {
    i18n = i18nPassed;
    this.createSettingsDom_();

    pskl.utils.Event.addEventListener(this.settingsContainer, 'click', this.onSettingsContainerClick_, this);
    pskl.utils.Event.addEventListener(document.body, 'click', this.onBodyClick_, this);

    $.subscribe(Events.CLOSE_SETTINGS_DRAWER, this.closeDrawer_.bind(this));
  };

  ns.SettingsController.prototype.onSettingsContainerClick_ = function (evt) {
    var setting = pskl.utils.Dom.getData(evt.target, 'setting');
    if (!setting) {
      return;
    }

    if (this.currentSetting != setting) {
      this.loadSetting_(setting);
    } else {
      this.closeDrawer_();
    }

    evt.stopPropagation();
    evt.preventDefault();
  };

  ns.SettingsController.prototype.onBodyClick_ = function (evt) {
    var target = evt.target;

    var isInDrawerContainer = pskl.utils.Dom.isParent(target, this.drawerContainer);
    var isInSettingsIcon = target.dataset.setting;
    var isInSettingsContainer = isInDrawerContainer || isInSettingsIcon;

    if (this.isExpanded && !isInSettingsContainer) {
      this.closeDrawer_();
    }
  };

  ns.SettingsController.prototype.loadSetting_ = function (setting) {
    this.drawerContainer.innerHTML = pskl.utils.Template.get(settings[setting].template);

    // when switching settings controller, destroy previously loaded controller
    this.destroyCurrentController_();

    this.currentSetting = setting;
    this.currentController = new settings[setting].controller(this.piskelController);
    this.currentController.init(i18n);

    pskl.app.shortcutService.registerShortcut(this.closeDrawerShortcut, this.closeDrawer_.bind(this));

    pskl.utils.Dom.removeClass(SEL_SETTING_CLS);
    var selectedSettingButton = document.querySelector('[data-setting=' + setting + ']');
    if (selectedSettingButton) {
      selectedSettingButton.classList.add(SEL_SETTING_CLS);
    }
    this.settingsContainer.classList.add(EXP_DRAWER_CLS);

    this.isExpanded = true;
  };

  ns.SettingsController.prototype.closeDrawer_ = function () {
    pskl.utils.Dom.removeClass(SEL_SETTING_CLS);
    this.settingsContainer.classList.remove(EXP_DRAWER_CLS);

    this.isExpanded = false;
    this.currentSetting = null;
    document.activeElement.blur();

    this.destroyCurrentController_();
  };

  ns.SettingsController.prototype.destroyCurrentController_ = function () {
    if (this.currentController) {
      pskl.app.shortcutService.unregisterShortcut(this.closeDrawerShortcut);
      if (this.currentController.destroy) {
        this.currentController.destroy();
        this.currentController = null;
      }
    }
  };

  ns.SettingsController.prototype.createUserSetting = function () {
    var templateData = {
      dataSetting: 'user',
      iconSetting: 'icon-settings-gear-white',
      title: '<span class=\'highlight\'>PREFERENCES</span></br>'
    };
    var templateId = 'gif-export-desc-template';
    return pskl.utils.Template.fillInTemplate(templateId, templateData);
  }

   /**
   * @private
   */
  ns.SettingsController.prototype.createSettingsDom_ = function () {
    console.log('Inside createSettingsDom_()');
    var html = '';
    var tpl = pskl.utils.Template.get('settings-template');
    var result1 = pskl.utils.Template.replace(tpl, {
      dataSetting: 'user',
      iconSetting: 'icon-settings-gear-white',
      title: '<span class=\'highlight\'>PREFERENCES</span></br>'
    });

    var changeTitle = '<span class=\'highlight\'>' + i18n.resizeSetting() + '</span></br>' + i18n.resizeSettingFirst();
    var tpl = pskl.utils.Template.get('settings-template');
    var result2 = pskl.utils.Template.replace(tpl, {
      dataSetting: 'resize',
      iconSetting: 'icon-settings-resize-white',
      title: changeTitle
    });

    changeTitle = '<span class=\'highlight\'>' + i18n.saveSetting() + '</span></br>' + i18n.saveSettingFirst() + '<br/>' + i18n.saveSettingSecond();
    var tpl = pskl.utils.Template.get('settings-template');
    var result3 = pskl.utils.Template.replace(tpl, {
      dataSetting: 'save',
      iconSetting: 'icon-settings-save-white',
      title: changeTitle
    });

    changeTitle = '<span class=\'highlight\'>' + i18n.exportSetting() + '</span></br>' + i18n.exportSettingFirst() + '<br/>' + i18n.exportSettingSecond();
    var tpl = pskl.utils.Template.get('settings-template');
    var result4 = pskl.utils.Template.replace(tpl, {
      dataSetting: 'export',
      iconSetting: 'icon-settings-export-white',
      title: changeTitle
    });

    html = html + result1 + result2 + result3 + result4;

    console.log(html);
    $('#verticalCenterer').html(html);
  };
})();
