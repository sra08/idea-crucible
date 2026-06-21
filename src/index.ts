// Public surface. Screens should import from here.

export * from "./types";
export * from "./constants";
export {
  addIdea,
  promoteToArena,
  completeMicroTask,
  addMicroTask,
  buryIdea,
  cprRevive,
  grantSabbatical,
  processRepitches,
  ArenaFullError,
} from "./engine";
export {
  activeArenaIdeas,
  freeSlots,
  hasFreeSlot,
  daysSinceExecution,
  isAtDecisionPoint,
  progress,
} from "./arena";
export { generateMicroSteps } from "./microsteps";
export { loadState, getIdea } from "./store";

import { setupNotifications, scheduleNagWindow, cancelNotification } from "./notifications";
import { getSettings, saveSettings } from "./store";
import { processRepitches } from "./engine";
import { NagWindow } from "./types";
import { uid } from "./store";

// Call once when the app launches: ask for permission, return any sabbatical
// ideas whose re pitch date has arrived.
export async function initEngine() {
  const granted = await setupNotifications();
  const repitched = await processRepitches();
  return { notificationsGranted: granted, repitched };
}

// Add a daily nag window and wire up its repeating notification.
export async function addNagWindow(label: string, hour: number, minute: number) {
  const settings = await getSettings();
  const window: NagWindow = { id: uid(), label, hour, minute, enabled: true };
  window.notificationId = await scheduleNagWindow(window);
  settings.nagWindows.push(window);
  await saveSettings(settings);
  return window;
}

export async function removeNagWindow(windowId: string) {
  const settings = await getSettings();
  const window = settings.nagWindows.find((w) => w.id === windowId);
  if (window) await cancelNotification(window.notificationId);
  settings.nagWindows = settings.nagWindows.filter((w) => w.id !== windowId);
  await saveSettings(settings);
}
