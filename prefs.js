import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class PaperShellPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();
    const page = new Adw.PreferencesPage();

    // --- APPEARANCE GROUP ---
    const appearanceGroup = new Adw.PreferencesGroup({ title: "Appearance" });

    const opacityRow = new Adw.ActionRow({
      title: "Texture Intensity",
      subtitle: "Recommended: 0.3. Max is safely capped.",
    });

    // GTK Scale (Slider)
    const slider = Gtk.Scale.new_with_range(
      Gtk.Orientation.HORIZONTAL,
      0.05, // Minimum value
      1.0, // Maximum value
      0.05, // Step increment
    );

    // Format the slider
    slider.set_hexpand(true);
    slider.set_valign(Gtk.Align.CENTER);
    slider.set_draw_value(true);
    slider.set_digits(2);
    slider.set_value_pos(Gtk.PositionType.RIGHT);
    slider.set_size_request(200, -1);

    // Bind the slider to the GSettings database
    settings.bind(
      "opacity",
      slider.get_adjustment(),
      "value",
      Gio.SettingsBindFlags.DEFAULT,
    );

    opacityRow.add_suffix(slider);
    appearanceGroup.add(opacityRow);

    // BEHAVIOR GROUP
    const behaviorGroup = new Adw.PreferencesGroup({ title: "Behavior" });

    const fullscreenRow = new Adw.SwitchRow({
      title: "Hide in Fullscreen",
      subtitle: "Automatically disable texture when watching videos or gaming.",
    });
    settings.bind(
      "hide-in-fullscreen",
      fullscreenRow,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );

    const nightLightRow = new Adw.SwitchRow({
      title: "Sync with Night Light",
      subtitle: "Automatically turn on/off when system Night Light is toggled.",
    });
    settings.bind(
      "sync-night-light",
      nightLightRow,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );

    behaviorGroup.add(fullscreenRow);
    behaviorGroup.add(nightLightRow);

    page.add(appearanceGroup);
    page.add(behaviorGroup);
    window.add(page);
  }
}
