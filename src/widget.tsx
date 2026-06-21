// Call refreshWidget() from the app whenever the data behind the widget
// changes, so the home screen updates instantly instead of waiting for the
// next system refresh. Good moments: after completing a micro task, after
// promoting or burying an idea, and once on app launch.
//
// Guarded to Android, since the widget library is Android only here. On any
// other platform this is a harmless no-op.

import React from "react";
import { Platform } from "react-native";
import { loadState } from "./store";
import { widgetViewModel } from "./widgetView";
import { StreakWidget } from "./StreakWidget";

export async function refreshWidget(): Promise<void> {
  if (Platform.OS !== "android") return;
  try {
    const { requestWidgetUpdate } = require("react-native-android-widget");
    const state = await loadState();
    const vm = widgetViewModel(state);
    await requestWidgetUpdate({
      widgetName: "Status",
      renderWidget: () => <StreakWidget vm={vm} />,
      widgetNotFound: () => {},
    });
  } catch {
    // Widget not installed on the home screen, or library unavailable. Ignore.
  }
}
