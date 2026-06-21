// Tunable rules for the Idea Engine.
// Change these in one place rather than scattering magic numbers.

export const ARENA_MAX_SLOTS = 2; // hard cap on active projects

// The stagnation timeline, measured in days since the last real execution.
// "Execution" means completing a micro task, never just opening the app.
export const NUDGE_DAY = 10; // gentle reminder
export const ULTIMATUM_DAY = 13; // 24 hour warning
export const DECISION_DAY = 14; // locked decision portal / cemetery countdown

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Default model used by the micro step generator. Swap freely.
export const DEFAULT_MODEL = "claude-sonnet-4-6";
