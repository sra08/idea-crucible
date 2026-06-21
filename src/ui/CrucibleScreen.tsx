import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

import { colors, fonts } from "./theme";
import { ChunkyCard } from "./ChunkyCard";
import { ScreenTitle } from "./ScreenTitle";
import { useNav } from "./nav";

import { loadState } from "../store";
import { activeArenaIdeas, daysSinceExecution } from "../arena";
import { DECISION_DAY, MS_PER_DAY } from "../constants";
import { AppState, Idea } from "../types";

function executionsThisWeek(state: AppState, now = Date.now()): number {
  const start = now - 7 * MS_PER_DAY;
  let n = 0;
  for (const idea of state.ideas)
    for (const t of idea.microTasks) if (t.completedAt && t.completedAt >= start) n++;
  return n;
}

export function CrucibleScreen() {
  const nav = useNav();
  const [state, setState] = useState<AppState | null>(null);
  useEffect(() => {
    loadState().then(setState);
  }, [nav.version]);

  if (!state) return null;
  const active = activeArenaIdeas(state);
  const sandbox = state.ideas.filter((i) => i.status === "sandbox").length;
  const buried = state.ideas.filter((i) => i.status === "cemetery").length;
  const week = executionsThisWeek(state);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.screen }} contentContainerStyle={styles.scroll}>
      <ScreenTitle>The Crucible</ScreenTitle>

      <View style={styles.statRow}>
        <Stat n={active.length} label="in the arena" />
        <Stat n={week} label="done this week" />
      </View>
      <View style={styles.statRow}>
        <Stat n={sandbox} label="in the sandbox" />
        <Stat n={buried} label="in the cemetery" />
      </View>

      <ChunkyCard color={colors.gold} style={{ marginTop: 6 }}>
        <Text style={styles.cardTitle}>ACTIVE PROJECTS</Text>
        {active.length === 0 && <Text style={styles.muted}>Nothing forging right now.</Text>}
        {active.map((idea) => (
          <ProjectLine key={idea.id} idea={idea} />
        ))}
      </ChunkyCard>
    </ScrollView>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statN}>{n}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ProjectLine({ idea }: { idea: Idea }) {
  const since = daysSinceExecution(idea) ?? 0;
  const left = Math.max(0, Math.ceil(DECISION_DAY - since));
  return (
    <View style={styles.line}>
      <Text style={styles.lineName}>{idea.title}</Text>
      <Text style={styles.lineDays}>{left}d left</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  statRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: colors.nav, borderWidth: 3, borderColor: colors.ink, borderRadius: 16, padding: 14 },
  statN: { fontFamily: fonts.display, fontSize: 32, color: colors.gold },
  statLabel: { fontFamily: fonts.mono, fontSize: 11, color: colors.boneDim, marginTop: 4 },
  cardTitle: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink, letterSpacing: 0.5, marginBottom: 10 },
  muted: { fontFamily: fonts.body, fontSize: 14, color: colors.ink, opacity: 0.7 },
  line: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 7, borderTopWidth: 1.5, borderTopColor: "rgba(22,48,47,0.2)" },
  lineName: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink, flexShrink: 1 },
  lineDays: { fontFamily: fonts.monoBold, fontSize: 13, color: colors.ink },
});
