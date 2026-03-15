# PaperShell 📜

A GNOME 49 Shell Extension designed to enhance screen readability and reduce eye strain by adding a subtle, customizable texture overlay to your entire desktop.

Inspired by research on visual ergonomics, this extension applies a noise texture (grain effect) over your screen. By mimicking the natural texture of paper, it softens the harshness of flat, bright digital displays, making long reading or coding sessions significantly more comfortable for your eyes.

### ✨ Features

- **Global Overlay:** Applies a seamless, semi-transparent texture across your entire screen and all monitors.
- **Zero Interference:** The overlay is completely "click-through." It will never block you from interacting with your windows or apps.
- **Quick Settings Menu:** Easily toggle the effect on or off from the top-right GNOME system panel.
- **Hot-Swappable Textures:** Switch between different textures on the fly without needing to restart the GNOME Shell, just replace the noise.png image.

#### Filter Off

![filter_off](./README_images/filter_off.png)

#### Filter On

![filter_on](./README_images/filter_on.png)

---

### 📥 Installation

Currently, this extension is installed manually.

1. Download or clone this repository.
2. Ensure the folder is named exactly `papershell@lalovene.github.com`.
3. Move the folder into your local GNOME extensions directory:

```bash
mv papershell@lalovene.github.com ~/.local/share/gnome-shell/extensions/

```

4. Log out of your Fedora/GNOME session and log back in to force Wayland to load the new files.
5. Enable the extension via the terminal:

```bash
gnome-extensions enable papershell@lalovene.github.com

```

_(Alternatively, enable it using the "Extensions" GUI app)._

### 🙏 Credits & Acknowledgements

This extension is a Linux/GNOME port inspired by the original open-source Windows desktop application.

- **Original Windows App Concept:** Created by Umer Hamaaz ([Umer-Hamaaz/Papersrc](https://github.com/Umer-Hamaaz/Papersrc)).
- **Default Noise Texture:** Photography provided by [Josiah Rock on Unsplash](https://unsplash.com/@josiahrock).
