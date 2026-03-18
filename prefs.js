import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class PaperShellPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();

    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup({
      title: "Appearance",
      description: "Configure how the paper texture looks on your screen.",
    });

    // Layout row
    const opacityRow = new Adw.ActionRow({
      title: "Texture Intensity",
      subtitle: "Recommended: 0.3. Max is safely capped in the engine.",
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

    // Assemble the UI
    opacityRow.add_suffix(slider);
    group.add(opacityRow);
    page.add(group);
    window.add(page);
  }
}
