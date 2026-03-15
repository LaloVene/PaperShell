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

      this._slider = new Slider.Slider(0.15); // Default to 15% opacity
      this._slider.x_expand = true;
      this._slider.connect("notify::value", () => {
        this._extension.setOpacity(this._slider.value);
      });

      sliderItem.add_child(this._slider);
      this.menu.addMenuItem(sliderItem);
    }

    getOpacity() {
      return this._slider.value;
    }
  },
);

export default class PaperSrcExtension extends Extension {
  enable() {
    this._overlay = null;
    this._monitorId = null;

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
      x: 0,
      y: 0,
    });

    Main.layoutManager.uiGroup.add_child(this._overlay);

    this._updateSize();
    this._monitorId = Main.layoutManager.connect(
      "monitors-changed",
      this._updateSize.bind(this),
    );

    // Sync the overlay's initial opacity with the slider's value
    this.setOpacity(this._indicator.getOpacity());
  }

  disableOverlay() {
    if (this._monitorId) {
      Main.layoutManager.disconnect(this._monitorId);
      this._monitorId = null;
    }
    if (this._overlay) {
      this._overlay.destroy();
      this._overlay = null;
    }
  }

  _updateSize() {
    if (this._overlay) {
      this._overlay.set_size(global.stage.width, global.stage.height);
    }
  }

  setOpacity(value) {
    if (this._overlay) {
      // Clutter opacity maps 0.0-1.0 to an integer from 0-255
      this._overlay.opacity = Math.floor(value * 255);
    }
  }
}
