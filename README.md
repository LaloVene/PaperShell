![PaperShell Banner](./README_images/banner.png)

# PaperShell 📜

<div align="center">

PaperShell is a GNOME Shell extension that draws a light paper-like grain over the desktop. The effect is subtle by design: the goal is to take the edge off large flat areas of color without getting in the way of normal use.

[![GNOME Shell](https://img.shields.io/badge/GNOME_Shell-46_|_47_|_48_|_49_|_50-4A86CF?style=flat-square&logo=gnome&logoColor=white)](https://extensions.gnome.org/extension/9524/papershell/)
[![License](https://img.shields.io/badge/License-GPL_3.0-green?style=flat-square)](LICENSE)

</div>

#### Before:

![filter_off](./README_images/filter_off.jpg)

#### After:

![filter_on](./README_images/filter_on.jpg)

## 📥 Installation

This extension uses GSettings, so the schema has to be compiled after installation.

1. Clone the repository into your local GNOME Shell extensions directory.

    ```bash
    git clone https://github.com/LaloVene/PaperShell.git ~/.local/share/gnome-shell/extensions/papershell@lalovene.github.com
    ```

2. Compile the schema.

    ```bash
    cd ~/.local/share/gnome-shell/extensions/papershell@lalovene.github.com
    glib-compile-schemas schemas/
    ```

3. Restart GNOME Shell by logging out and back in.

4. Enable the extension from the Extensions app, or run:

    ```bash
    gnome-extensions enable papershell@lalovene.github.com
    ```

## ⚙️ Configuration

Open the Extensions app and click the gear icon next to PaperShell.

Available settings:

- Texture Opacity
- Hide in Fullscreen
- Sync with Night Light
- Show Quick Settings Toggle

![settings](./README_images/settings.png)

## 🙏 Credits & Acknowledgements

This extension was inspired by the original open-source Windows app concept.

- Original Windows app concept: [Umer-Hamaaz/Papersrc](https://github.com/Umer-Hamaaz/Papersrc)
