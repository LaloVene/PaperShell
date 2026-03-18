import GObject from "gi://GObject";
import St from "gi://St";
import Clutter from "gi://Clutter";

import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import {
  QuickToggle,
  SystemIndicator,
} from "resource:///org/gnome/shell/ui/quickSettings.js";

// 1. Create the Quick Settings Toggle
const PaperShellToggle = GObject.registerClass(
  class PaperShellToggle extends QuickToggle {
    _init(extension) {
      super._init({
        title: _("PaperShell"),
        iconName: "view-reveal-symbolic",
        toggleMode: true,
      });
      this._extension = extension;

      // Bind the toggle state to the GSettings
      this._extension._settings.bind("enabled-state", this, "checked", 0);

      // Listen for clicks
      this.connect("clicked", () => {
        if (this.checked) {
          this._extension.enableOverlay();
        } else {
          this._extension.disableOverlay();
        }
      });
    }
  },
);

// Toggle Indicator
const PaperShellIndicator = GObject.registerClass(
  class PaperShellIndicator extends SystemIndicator {
    _init(extension) {
      super._init();
      this.quickSettingsItems.push(new PaperShellToggle(extension));
    }
  },
);

export default class PaperShellExtension extends Extension {
  enable() {
    this._overlay = null;
    this._overviewShowingId = null;
    this._overviewHidingId = null;
    this._settingsChangedId = null;

    // Load settings database
    this._settings = this.getSettings();

    // Setup Quick Settings
    this._indicator = new PaperShellIndicator(this);
    Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);

    // Listen to changes from the Settings app
    this._settingsChangedId = this._settings.connect("changed::opacity", () => {
      this.setOpacity(this._settings.get_double("opacity"));
    });

    // Hide the overlay when entering the overview: allows for drag and drop
    this._overviewShowingId = Main.overview.connect("showing", () => {
      if (this._overlay) this._overlay.hide();
    });

    this._overviewHidingId = Main.overview.connect("hiding", () => {
      if (this._overlay && this._settings.get_boolean("enabled-state")) {
        this._overlay.show();
      }
    });

    // Enable overlay if the saved state is enabled
    if (this._settings.get_boolean("enabled-state")) {
      this.enableOverlay();
    }
  }

  disable() {
    if (this._overviewShowingId) {
      Main.overview.disconnect(this._overviewShowingId);
      this._overviewShowingId = null;
    }
    if (this._overviewHidingId) {
      Main.overview.disconnect(this._overviewHidingId);
      this._overviewHidingId = null;
    }
    if (this._settingsChangedId) {
      this._settings.disconnect(this._settingsChangedId);
      this._settingsChangedId = null;
    }

    this.disableOverlay();

    if (this._indicator) {
      this._indicator.destroy();
      this._indicator = null;
    }

    this._settings = null;
  }

  enableOverlay() {
    if (this._overlay) return;

    // Create the fullscreen, click-through widget
    this._overlay = new St.Widget({
      style_class: "papersrc-overlay",
      reactive: false, // lets you click through it
      can_focus: false,
      x: 0,
      y: 0,
    });

    // Binds the overlay to all monitors
    this._overlay.add_constraint(
      new Clutter.BindConstraint({
        source: global.stage,
        coordinate: Clutter.BindCoordinate.ALL,
      }),
    );

    Main.layoutManager.uiGroup.add_child(this._overlay);

    // Fetch saved opacity
    this.setOpacity(this._settings.get_double("opacity"));
  }

  disableOverlay() {
    if (this._overlay) {
      this._overlay.destroy();
      this._overlay = null;
    }
  }

  setOpacity(value) {
    if (this._overlay) {
      // Prevents the screen from becoming 100% opaque/black.
      let safeOpacity = value * 0.5;
      this._overlay.opacity = Math.floor(safeOpacity * 255);
    }
  }
}
