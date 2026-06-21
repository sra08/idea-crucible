if (typeof globalThis.DOMException === 'undefined') {
  class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name ?? 'Error';
      this.code = 0;
    }
  }
  globalThis.DOMException = DOMException;
  if (typeof global !== 'undefined') {
    global.DOMException = DOMException;
  }
}

import { registerRootComponent } from "expo";
import { registerWidgetTaskHandler } from "react-native-android-widget";
import App from "./App";
import { widgetTaskHandler } from "./src/widgetTaskHandler";

registerWidgetTaskHandler(widgetTaskHandler);
registerRootComponent(App);
