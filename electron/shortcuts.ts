// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import { globalShortcut, app } from "electron"
import { IShortcutsHelperDeps } from "./main"

export class ShortcutsHelper {
  private deps: IShortcutsHelperDeps

  constructor(deps: IShortcutsHelperDeps) {
    this.deps = deps
  }

  public registerGlobalShortcuts(): void {

    globalShortcut.register("Shift+Enter", async () => {
      const mainWindow = this.deps.getMainWindow()
      if (mainWindow) {
        try {
          mainWindow.webContents.send("on-prompt-send")
          console.log("Prompting to send...")
        } catch (error) {
          console.error("Error sending prompt:", error)
        }
      }
    })

    globalShortcut.register("Option+Enter", async () => {
      const mainWindow = this.deps.getMainWindow();
      if (mainWindow) {
        try {
          // 🔥 Alternates between starting and stopping recording
          mainWindow.webContents.send("toggle-recording");
          console.log("🎤 Alternating recording...");
        } catch (error) {
          console.error("Error toggling recording:", error);
        }
      }
    });

    globalShortcut.register("CommandOrControl+B", () => {
      this.deps.toggleMainWindow()
    })

    globalShortcut.register("CommandOrControl+Q", () => {
      console.log("Command/Ctrl + Q pressed. Closing app.")
      app.quit()
    })

    // Unregister shortcuts when quitting
    app.on("will-quit", () => {
      globalShortcut.unregisterAll()
    })
  }
}