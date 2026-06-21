// The engine ties the pure rules, the store, and the notification scheduler
// together. The screens in your app call these functions and nothing lower.
//
// The single most important invariant lives here: completing a micro task is
// the ONLY thing that resets the stagnation clock, and resetting the clock
// means cancelling the old day 10 / 13 / 14 alerts and scheduling fresh ones
// from "now". Opening the app does not count. Thinking does not count.

import { ARENA_MAX_SLOTS } from "./constants";
import { hasFreeSlot } from "./arena";
import {
  getIdea,
  getSettings,
  loadState,
  saveState,
  uid,
  upsertIdea,
} from "./store";
import {
  cancelStagnationAlerts,
  scheduleStagnationAlerts,
} from "./notifications";
import { Idea, MicroTask } from "./types";

export class ArenaFullError extends Error {
  constructor() {
    super(`The arena already holds ${ARENA_MAX_SLOTS} projects. Complete or shelf one first.`);
    this.name = "ArenaFullError";
  }
}

// Drop a raw thought into the sandbox. No pressure, no timers.
export async function addIdea(input: {
  title: string;
  notes?: string;
  tags?: string[];
}): Promise<Idea> {
  const idea: Idea = {
    id: uid(),
    title: input.title,
    notes: input.notes ?? "",
    tags: input.tags ?? [],
    status: "sandbox",
    createdAt: Date.now(),
    enteredArenaAt: null,
    lastExecutionAt: null,
    microTasks: [],
    alerts: {},
    sabbaticalUsed: false,
    repitchAt: null,
    buriedAt: null,
  };
  await upsertIdea(idea);
  return idea;
}

// Move an idea from the sandbox into the arena. Enforces the two slot cap and
// starts the stagnation clock. microTasks are usually produced by the micro
// step generator and passed in here.
export async function promoteToArena(
  ideaId: string,
  microTaskTitles: string[]
): Promise<Idea> {
  const state = await loadState();
  if (!hasFreeSlot(state)) throw new ArenaFullError();

  const idea = state.ideas.find((i) => i.id === ideaId);
  if (!idea) throw new Error("Idea not found");

  const now = Date.now();
  idea.status = "arena";
  idea.enteredArenaAt = now;
  idea.lastExecutionAt = null;
  idea.repitchAt = null;
  idea.buriedAt = null;
  idea.microTasks = microTaskTitles.map((title) => makeTask(title));

  const settings = state.settings;
  idea.alerts = await scheduleStagnationAlerts(idea, now, settings.nagIntensity);

  await saveState(state);
  return idea;
}

// The heartbeat of the whole system. Completing a task is a real execution,
// so we stamp lastExecutionAt and reset the stagnation clock.
export async function completeMicroTask(
  ideaId: string,
  taskId: string
): Promise<Idea> {
  const idea = await getIdea(ideaId);
  if (!idea) throw new Error("Idea not found");

  const task = idea.microTasks.find((t) => t.id === taskId);
  if (!task) throw new Error("Task not found");
  if (task.done) return idea; // already done, nothing to reset

  const now = Date.now();
  task.done = true;
  task.completedAt = now;
  idea.lastExecutionAt = now;

  await resetStagnationClock(idea, now);
  await upsertIdea(idea);
  return idea;
}

export async function addMicroTask(ideaId: string, title: string): Promise<Idea> {
  const idea = await getIdea(ideaId);
  if (!idea) throw new Error("Idea not found");
  idea.microTasks.push(makeTask(title));
  await upsertIdea(idea);
  return idea;
}

// ----- The day 14 decision portal options -----

// Bury it. Archived to the cemetery, out of sight, never deleted.
export async function buryIdea(ideaId: string): Promise<Idea> {
  const idea = await getIdea(ideaId);
  if (!idea) throw new Error("Idea not found");
  await cancelStagnationAlerts(idea.alerts);
  idea.alerts = {};
  idea.status = "cemetery";
  idea.buriedAt = Date.now();
  idea.enteredArenaAt = null;
  await upsertIdea(idea);
  return idea;
}

// CPR. Earns an extension only by completing a micro task right now. There is
// no free pass, so this requires a real, currently incomplete task id.
export async function cprRevive(ideaId: string, taskId: string): Promise<Idea> {
  const idea = await getIdea(ideaId);
  if (!idea) throw new Error("Idea not found");
  const task = idea.microTasks.find((t) => t.id === taskId);
  if (!task || task.done) {
    throw new Error("CPR requires completing an unfinished micro task. No free passes.");
  }
  // completeMicroTask stamps the execution and resets the clock for us.
  return completeMicroTask(ideaId, taskId);
}

// Sabbatical. One time only. Hides the idea and schedules it to re pitch on a
// future date. Frees the arena slot in the meantime.
export async function grantSabbatical(
  ideaId: string,
  repitchAt: number
): Promise<Idea> {
  const idea = await getIdea(ideaId);
  if (!idea) throw new Error("Idea not found");
  if (idea.sabbaticalUsed) {
    throw new Error("This idea already used its one sabbatical.");
  }
  await cancelStagnationAlerts(idea.alerts);
  idea.alerts = {};
  idea.status = "sabbatical";
  idea.sabbaticalUsed = true;
  idea.repitchAt = repitchAt;
  idea.enteredArenaAt = null;
  await upsertIdea(idea);
  return idea;
}

// Call this on app launch. Any sabbatical idea whose date has arrived gets
// pushed back to the sandbox so it pitches itself again.
export async function processRepitches(now = Date.now()): Promise<Idea[]> {
  const state = await loadState();
  const returned: Idea[] = [];
  for (const idea of state.ideas) {
    if (idea.status === "sabbatical" && idea.repitchAt != null && idea.repitchAt <= now) {
      idea.status = "sandbox";
      idea.repitchAt = null;
      returned.push(idea);
    }
  }
  if (returned.length) await saveState(state);
  return returned;
}

// ----- internals -----

function makeTask(title: string): MicroTask {
  return { id: uid(), title, done: false, createdAt: Date.now(), completedAt: null };
}

async function resetStagnationClock(idea: Idea, anchorMs: number): Promise<void> {
  await cancelStagnationAlerts(idea.alerts);
  const settings = await getSettings();
  idea.alerts = await scheduleStagnationAlerts(idea, anchorMs, settings.nagIntensity);
}
