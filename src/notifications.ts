// All expo-notifications access lives here.
//
// Design note: every alert this app sends is something the phone can know
// about in advance (a date the project hits day 10, 13, 14, or a daily nag
// time). That means we use local scheduled notifications only. There is no
// server and no remote push, which sidesteps the SDK 53+ requirement that
// remote push needs a development build. Local notifications still work
// everywhere, including Expo Go.
//
// Because JavaScript does not run while the app is backgrounded, we cannot
// "check a timer" in the background. We schedule the day 10 / 13 / 14 alerts
// up front and reschedule them from "now" every time the user executes.

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { MS_PER_DAY, NUDGE_DAY, ULTIMATUM_DAY, DECISION_DAY } from "./constants";
import { Idea, NagWindow, ScheduledAlerts, Settings } from "./types";

// Show banners while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ANDROID_CHANNEL = "idea-engine";

export async function setupNotifications(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
      name: "Idea Engine",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// Copy for each stage. Tone follows the user's chosen nag intensity.
function stageMessage(
  idea: Idea,
  stage: "nudge" | "ultimatum" | "decision",
  intensity: Settings["nagIntensity"]
): { title: string; body: string } {
  const blunt = intensity === "blunt";
  switch (stage) {
    case "nudge":
      return {
        title: blunt ? "Are we building or just dreaming?" : "A small nudge",
        body: blunt
          ? `${idea.title} has sat untouched for ${NUDGE_DAY} days. Check off one micro task today.`
          : `${idea.title} could use 5 minutes today. One micro task keeps it alive.`,
      };
    case "ultimatum":
      return {
        title: blunt ? "24 hour warning" : "Heads up",
        body: `Tomorrow ${idea.title} heads to the cemetery. Make a move or let it go.`,
      };
    case "decision":
      return {
        title: "Decision time",
        body: `${idea.title} is locked. Execute, revive, or bury it.`,
      };
  }
}

// Schedule the three stagnation alerts relative to a fresh anchor time.
// Returns the ids so the caller can store them on the idea and cancel later.
// Alerts whose fire time is already in the past are skipped.
export async function scheduleStagnationAlerts(
  idea: Idea,
  anchorMs: number,
  intensity: Settings["nagIntensity"]
): Promise<ScheduledAlerts> {
  const alerts: ScheduledAlerts = {};
  const plan: Array<[keyof ScheduledAlerts, number, "nudge" | "ultimatum" | "decision"]> = [
    ["nudgeId", NUDGE_DAY, "nudge"],
    ["ultimatumId", ULTIMATUM_DAY, "ultimatum"],
    ["decisionId", DECISION_DAY, "decision"],
  ];

  for (const [key, day, stage] of plan) {
    const fireAt = anchorMs + day * MS_PER_DAY;
    if (fireAt <= Date.now()) continue; // do not schedule in the past
    const { title, body } = stageMessage(idea, stage, intensity);
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { ideaId: idea.id, stage },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(fireAt),
        channelId: ANDROID_CHANNEL,
      },
    });
    alerts[key] = id;
  }
  return alerts;
}

// Cancel any of the stagnation alerts that are still scheduled.
export async function cancelStagnationAlerts(alerts: ScheduledAlerts): Promise<void> {
  const ids = [alerts.nudgeId, alerts.ultimatumId, alerts.decisionId].filter(
    (x): x is string => Boolean(x)
  );
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

// A repeating daily poke at one of the user's free time windows.
export async function scheduleNagWindow(window: NagWindow): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Free window open",
      body: "You have time right now. Open a project and knock out one micro task.",
      data: { kind: "nag-window", windowId: window.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: window.hour,
      minute: window.minute,
      channelId: ANDROID_CHANNEL,
    },
  });
}

export async function cancelNotification(id?: string): Promise<void> {
  if (id) await Notifications.cancelScheduledNotificationAsync(id);
}
