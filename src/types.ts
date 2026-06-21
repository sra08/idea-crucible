// The full data model for the Idea Engine.
// Everything is plain serialisable data so it round trips cleanly through storage.

export type IdeaStatus =
  | "sandbox" // raw dumping ground, no pressure
  | "arena" // active, one of at most two slots
  | "cemetery" // archived after burial, kept out of sight
  | "sabbatical"; // hidden, scheduled to re pitch itself later

export interface MicroTask {
  id: string;
  title: string; // e.g. "Create the GitHub repo"
  done: boolean;
  createdAt: number; // epoch ms
  completedAt: number | null;
}

// The notification identifiers expo hands back when we schedule the
// stagnation alerts. We hold onto them so we can cancel and reschedule
// whenever the user actually makes progress.
export interface ScheduledAlerts {
  nudgeId?: string; // day 10
  ultimatumId?: string; // day 13
  decisionId?: string; // day 14
}

export interface Idea {
  id: string;
  title: string;
  notes: string;
  tags: string[];
  status: IdeaStatus;
  createdAt: number;

  // Arena only fields. Null while the idea is still in the sandbox.
  enteredArenaAt: number | null;
  lastExecutionAt: number | null; // last time a micro task was completed
  microTasks: MicroTask[];
  alerts: ScheduledAlerts;

  // Whether this idea has already spent its single allowed extension.
  sabbaticalUsed: boolean;
  repitchAt: number | null; // when a sabbatical idea returns

  buriedAt: number | null; // when it went to the cemetery
}

// A free time window during which the nag bot is allowed to poke you.
export interface NagWindow {
  id: string;
  label: string; // e.g. "Evening, after work"
  hour: number; // 0..23
  minute: number; // 0..59
  notificationId?: string; // the repeating daily notification
  enabled: boolean;
}

export interface Settings {
  nagWindows: NagWindow[];
  nagIntensity: "gentle" | "blunt"; // tone of the call out copy
}

export interface AppState {
  ideas: Idea[];
  settings: Settings;
}
