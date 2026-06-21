// Android calls this in a headless background context on its own schedule
// (and on add, resize, and tap). Because it runs without the app being open,
// it reads state straight from storage and recomputes, so "days untouched"
// stays correct as time passes even if you never open the app.

import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { loadState } from "./store";
import { widgetViewModel } from "./widgetView";
import { StreakWidget } from "./StreakWidget";

const nameToWidget = {
  // Must match the "name" in the app.json plugin config.
  Status: StreakWidget,
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetName = props.widgetInfo.widgetName as keyof typeof nameToWidget;
  if (!nameToWidget[widgetName]) return;

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED": {
      const state = await loadState();
      const vm = widgetViewModel(state);
      props.renderWidget(<StreakWidget vm={vm} />);
      break;
    }
    case "WIDGET_CLICK":
      // clickAction "OPEN_APP" already brings the app forward.
      // Route to a specific screen here later if you want.
      break;
    case "WIDGET_DELETED":
    default:
      break;
  }
}
