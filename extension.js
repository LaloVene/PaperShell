import GObject from "gi://GObject";
import St from "gi://St";
import Clutter from "gi://Clutter";
import Gio from "gi://Gio";

import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import {
  QuickToggle,
  SystemIndicator,
} from "resource:///org/gnome/shell/ui/quickSettings.js";

// Create the Quick Settings Toggle
const PaperShellToggle = GObject.registerClass(
  class PaperShellToggle extends QuickToggle {
    _init(extension) {
      super._init({
        title: _("PaperShell"),
        iconName: "view-reveal-symbolic",
        toggleMode: true,
      });
      // Bind the toggle state to the GSettings
      extension._settings.bind("enabled-state", this, "checked", 0);
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
    // Load settings database
    this._settings = this.getSettings();

    // Setup Quick Settings
    this._indicator = new PaperShellIndicator(this);
    Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);

    // STATE LISTENER
    this._stateChangedId = this._settings.connect(
      "changed::enabled-state",
      () => {
        if (this._settings.get_boolean("enabled-state")) {
          this.enableOverlay();
        } else {
          this.disableOverlay();
        }
      },
    );

    this._opacityChangedId = this._settings.connect("changed::opacity", () => {
      this.setOpacity(this._settings.get_double("opacity"));
    });

    // NIGHT LIGHT SYNC
    this._colorSettings = new Gio.Settings({
      schema_id: "org.gnome.settings-daemon.plugins.color",
    });
    this._nightLightId = this._colorSettings.connect(
      "changed::night-light-enabled",
      () => {
        if (this._settings.get_boolean("sync-night-light")) {
          let nlEnabled = this._colorSettings.get_boolean(
            "night-light-enabled",
          );
          this._settings.set_boolean("enabled-state", nlEnabled);
        }
      },
    );

    // FULLSCREEN DETECTION
    this._fullscreenId = global.display.connect("in-fullscreen-changed", () => {
      if (!this._overlay || !this._settings.get_boolean("enabled-state"))
        return;

      let focusWindow = global.display.get_focus_window();
      let isFullscreen = focusWindow ? focusWindow.is_fullscreen() : false;

      if (isFullscreen && this._settings.get_boolean("hide-in-fullscreen")) {
        this._overlay.hide();
      } else {
        if (!Main.overview.visible) this._overlay.show();
      }
    });

    // Hide the overlay when entering the overview: allows for drag and drop
    this._overviewShowingId = Main.overview.connect("showing", () => {
      if (this._overlay) this._overlay.hide();
    });
    this._overviewHidingId = Main.overview.connect("hiding", () => {
      let focusWindow = global.display.get_focus_window();
      let isFullscreen = focusWindow ? focusWindow.is_fullscreen() : false;

      if (this._overlay && this._settings.get_boolean("enabled-state")) {
        if (
          !(isFullscreen && this._settings.get_boolean("hide-in-fullscreen"))
        ) {
          this._overlay.show();
        }
      }
    });

    // Enable overlay if the saved state is enabled
    if (this._settings.get_boolean("enabled-state")) {
      this.enableOverlay();
    }
  }

  disable() {
    if (this._stateChangedId) this._settings.disconnect(this._stateChangedId);
    if (this._opacityChangedId)
      this._settings.disconnect(this._opacityChangedId);
    if (this._nightLightId) this._colorSettings.disconnect(this._nightLightId);
    if (this._fullscreenId) global.display.disconnect(this._fullscreenId);
    if (this._overviewShowingId)
      Main.overview.disconnect(this._overviewShowingId);
    if (this._overviewHidingId)
      Main.overview.disconnect(this._overviewHidingId);

    this.disableOverlay();

    if (this._indicator) {
      this._indicator.destroy();
      this._indicator = null;
    }

    this._settings = null;
    this._colorSettings = null;
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
