// Pure functions for the arena rules and the stagnation clock.
// No storage, no notifications, no side effects, so this is trivially testable.

import { ARENA_MAX_SLOTS, DECISION_DAY, MS_PER_DAY } from "./constants";
import { AppState, Idea } from "./types";

export function activeArenaIdeas(state: AppState): Idea[] {
  return state.ideas.filter((i) => i.status === "arena");
}

export function freeSlots(state: AppState): number {
  return ARENA_MAX_SLOTS - activeArenaIdeas(state).length;
}

export function hasFreeSlot(state: AppState): boolean {
  return freeSlots(state) > 0;
}

// The clock starts from the last real execution. If nothing has been
// completed yet, it starts from the moment the idea entered the arena.
// Returns null for ideas that are not in the arena.
export function stagnationAnchor(idea: Idea): number | null {
  if (idea.status !== "arena") return null;
  return idea.lastExecutionAt ?? idea.enteredArenaAt;
}

export function daysSinceExecution(idea: Idea, now = Date.now()): number | null {
  const anchor = stagnationAnchor(idea);
  if (anchor == null) return null;
  return (now - anchor) / MS_PER_DAY;
}

// Day 14 reached with no progress. The app should lock the project and
// open the decision portal when this is true.
export function isAtDecisionPoint(idea: Idea, now = Date.now()): boolean {
  const days = daysSinceExecution(idea, now);
  return days != null && days >= DECISION_DAY;
}

export function progress(idea: Idea): { done: number; total: number } {
  const done = idea.microTasks.filter((t) => t.done).length;
  return { done, total: idea.microTasks.length };
}
