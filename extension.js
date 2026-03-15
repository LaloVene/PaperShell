import GObject from "gi://GObject";
import St from "gi://St";
import Clutter from "gi://Clutter";

import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as Slider from "resource:///org/gnome/shell/ui/slider.js";

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    _init(extension) {
      super._init(0.0, _("PaperSrc Indicator"));
      this._extension = extension;

      // Icon for the panel indicator
      this.add_child(
        new St.Icon({
          icon_name: "view-reveal-symbolic",
          style_class: "system-status-icon",
        }),
      );

      // Toggle for enabling/disabling the texture overlay
      this._toggle = new PopupMenu.PopupSwitchMenuItem(
        _("Enable Texture"),
        true,
      );
      this._toggle.connect("toggled", (item, state) => {
        if (state) {
          this._extension.enableOverlay();
        } else {
          this._extension.disableOverlay();
        }
      });
      this.menu.addMenuItem(this._toggle);

      // Opacity slider
      let sliderItem = new PopupMenu.PopupBaseMenuItem({ activate: false });
      let sliderLabel = new St.Label({
        text: _("Opacity: "),
        y_align: Clutter.ActorAlign.CENTER,
      });
      sliderItem.add_child(sliderLabel);

      // Default value 0.3 results in 15% actual opacity (0.3 * 0.5)
      this._slider = new Slider.Slider(0.3);
      this._slider.x_expand = true;
      this._slider.connect("notify::value", () => {
        this._extension.setOpacity(this._slider.value);
      });

      sliderItem.add_child(this._slider);
      this.menu.addMenuItem(sliderItem);
    }

    getSliderValue() {
      return this._slider.value;
    }
  },
);

export default class PaperShellExtension extends Extension {
  enable() {
    this._overlay = null;

    // Pass the extension instance to the indicator so they can communicate
    this._indicator = new Indicator(this);
    Main.panel.addToStatusArea(this.uuid, this._indicator);

    // Enable the overlay by default when the extension starts
    this.enableOverlay();
  }

  disable() {
    this.disableOverlay();

    if (this._indicator) {
      this._indicator.destroy();
      this._indicator = null;
    }
  }

  enableOverlay() {
    if (this._overlay) return;

    // Create the fullscreen, click-through widget
    this._overlay = new St.Widget({
      style_class: "papersrc-overlay",
      reactive: false, // Essential: lets you click through it
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

    Main.layoutManager.addChrome(this._overlay);

    // Sync the overlay's initial opacity with the slider's value
    this.setOpacity(this._indicator.getSliderValue());
  }

  disableOverlay() {
    if (this._overlay) {
      this._overlay.destroy();
      this._overlay = null;
    }
  }

  setOpacity(value) {
    if (this._overlay) {
      // SAFETY CAP: The slider (0.0 to 1.0) is multiplied by 0.5
      // This prevents the screen from becoming 100% opaque/black.
      let safeOpacity = value * 0.5;
      this._overlay.opacity = Math.floor(safeOpacity * 255);
    }
  }
}
