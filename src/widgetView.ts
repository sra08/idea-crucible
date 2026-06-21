// Pure function that turns app state into exactly what the widget shows.
// Both the periodic background refresh and the in app update call this, so the
// home screen and the app can never disagree.

import { DECISION_DAY } from "./constants";
import { activeArenaIdeas, daysSinceExecution, progress } from "./arena";
import { AppState } from "./types";

export interface WidgetVM {
  hasProject: boolean;
  title: string;
  daysSince: number; // whole days since the last real execution
  daysLeft: number; // days remaining before the cemetery, never below 0
  doneCount: number;
  totalCount: number;
}

const EMPTY: WidgetVM = {
  hasProject: false,
  title: "",
  daysSince: 0,
  daysLeft: 0,
  doneCount: 0,
  totalCount: 0,
};

// Surface the project most at risk, meaning the one that has gone the longest
// without an execution. That is the one the user needs to see at a glance.
export function widgetViewModel(state: AppState, now = Date.now()): WidgetVM {
  const active = activeArenaIdeas(state);
  if (active.length === 0) return EMPTY;

  let worst = active[0];
  let worstDays = daysSinceExecution(worst, now) ?? 0;
  for (const idea of active.slice(1)) {
    const d = daysSinceExecution(idea, now) ?? 0;
    if (d > worstDays) {
      worst = idea;
      worstDays = d;
    }
  }

  const days = Math.floor(worstDays);
  const { done, total } = progress(worst);
  return {
    hasProject: true,
    title: worst.title,
    daysSince: days,
    daysLeft: Math.max(0, Math.ceil(DECISION_DAY - worstDays)),
    doneCount: done,
    totalCount: total,
  };
}
