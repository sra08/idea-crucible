// Persistence. This is the only file that talks to storage.
// Everything else operates on in memory state and calls save().
//
// For a personal, single device app AsyncStorage with a JSON blob is plenty.
// If the idea list ever grows large or you want querying, swap the internals
// for expo-sqlite without changing the public functions below.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, Idea, Settings } from "./types";

const STORAGE_KEY = "idea-engine/state/v1";

const DEFAULT_SETTINGS: Settings = {
  nagWindows: [],
  nagIntensity: "blunt",
};

let cache: AppState | null = null;

// Small id helper. crypto.randomUUID is not guaranteed in React Native,
// so this is good enough for local, single user data.
export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function loadState(): Promise<AppState> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      cache = {
        ideas: parsed.ideas ?? [],
        settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      };
    } else {
      cache = { ideas: [], settings: DEFAULT_SETTINGS };
    }
  } catch (err) {
    console.warn("Failed to load state, starting fresh:", err);
    cache = { ideas: [], settings: DEFAULT_SETTINGS };
  }
  return cache;
}

export async function saveState(state: AppState): Promise<void> {
  cache = state;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function getIdea(id: string): Promise<Idea | undefined> {
  const state = await loadState();
  return state.ideas.find((i) => i.id === id);
}

// Insert or replace an idea, then persist.
export async function upsertIdea(idea: Idea): Promise<void> {
  const state = await loadState();
  const idx = state.ideas.findIndex((i) => i.id === idea.id);
  if (idx >= 0) state.ideas[idx] = idea;
  else state.ideas.push(idea);
  await saveState(state);
}

export async function getSettings(): Promise<Settings> {
  return (await loadState()).settings;
}

export async function saveSettings(settings: Settings): Promise<void> {
  const state = await loadState();
  state.settings = settings;
  await saveState(state);
}
