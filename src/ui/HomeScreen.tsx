// The home dashboard. Four zones: sandbox, arena, nag bot, crucible.
// Everything that can show real data does, and the buttons and slots are wired
// to open the matching flows through the nav context.

import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors, fonts } from "./theme";
import { ChunkyCard } from "./ChunkyCard";
import { ChunkyButton } from "./ChunkyButton";
import { useNav } from "./nav";

import { addIdea } from "../engine";
import { loadState } from "../store";
import { activeArenaIdeas, daysSinceExecution, progress } from "../arena";
import { widgetViewModel } from "../widgetView";
import { DECISION_DAY, MS_PER_DAY } from "../constants";
import { AppState, Idea } from "../types";

function daysLeftFor(idea: Idea, now = Date.now()): number {
  const since = daysSinceExecution(idea, now) ?? 0;
  return Math.max(0, Math.ceil(DECISION_DAY - since));
}

function executionsLast7Days(state: AppState, now = Date.now()): number[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const start = today.getTime() - 6 * MS_PER_DAY;
  const buckets = [0, 0, 0, 0, 0, 0, 0];
  for (const idea of state.ideas) {
    for (const task of idea.microTasks) {
      if (task.completedAt && task.completedAt >= start) {
        const idx = Math.floor((task.completedAt - start) / MS_PER_DAY);
        if (idx >= 0 && idx < 7) buckets[idx]++;
      }
    }
  }
  return buckets;
}

export function HomeScreen() {
  const nav = useNav();
  const [state, setState] = useState<AppState | null>(null);
  const [draft, setDraft] = useState("");

  const refresh = useCallback(async () => setState(await loadState()), []);
  useEffect(() => {
    refresh();
  }, [refresh, nav.version]);

  const onJot = async () => {
    const title = draft.trim();
    if (!title) return;
    await addIdea({ title });
    setDraft("");
    nav.bump();
  };

  const active = state ? activeArenaIdeas(state) : [];
  const slots: (Idea | null)[] = [active[0] ?? null, active[1] ?? null];
  const crux = state ? widgetViewModel(state) : null;
  const week = state ? executionsLast7Days(state) : [0, 0, 0, 0, 0, 0, 0];
  const weekMax = Math.max(1, ...week);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.screen }}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.wordmark}>
          IDEA{"\n"}CRUCIBLE <Text style={styles.version}>v1.0</Text>
        </Text>
        <Pressable onPress={() => nav.setTab("profile")}>
          <MaterialCommunityIcons name="cog-outline" size={24} color={colors.boneDim} />
        </Pressable>
      </View>

      <ChunkyCard color={colors.lime}>
        <ZoneHead icon="laptop" title="Jot it down" sub="the sandbox · no pressure" />
        <TextInput
          style={styles.field}
          placeholder="Type your raw thought here..."
          placeholderTextColor={colors.fieldText}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={onJot}
          returnKeyType="done"
        />
        <ChunkyButton label="Quick jot" onPress={onJot} />
      </ChunkyCard>

      <ChunkyCard color={colors.coral}>
        <ZoneHead icon="sword-cross" title="The Arena" sub="2 slots · no mercy" />
        {slots.map((idea, i) =>
          idea ? (
            <Pressable key={idea.id} onPress={() => nav.openProject(idea.id)}>
              <FilledSlot idea={idea} />
            </Pressable>
          ) : (
            <Pressable key={`empty-${i}`} onPress={nav.openPromote}>
              <EmptySlot />
            </Pressable>
          )
        )}
        <ChunkyButton label="Commit now" onPress={nav.openPromote} />
      </ChunkyCard>

      <ChunkyCard color={colors.teal}>
        <ZoneHead icon="bell-outline" title="Nag-Bot" sub="pokes you on schedule" />
        <View style={styles.chips}>
          {(state?.settings.nagWindows.length
            ? state.settings.nagWindows.map(
                (w) => `${w.label} ${String(w.hour).padStart(2, "0")}:${String(w.minute).padStart(2, "0")}`
              )
            : ["No windows set"]
          ).map((c) => (
            <Text key={c} style={styles.chip}>
              {c}
            </Text>
          ))}
        </View>
        <ChunkyButton label="Set schedule" onPress={() => nav.setTab("profile")} />
      </ChunkyCard>

      <Pressable onPress={() => nav.setTab("crucible")}>
        <ChunkyCard color={colors.gold}>
          <ZoneHead icon="anvil" title="The Crucible" sub="where ideas get forged" />
          <View style={styles.crux}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cruxBig}>
                {crux?.hasProject ? crux.daysLeft : 0}
                <Text style={styles.cruxUnit}> days</Text>
              </Text>
              <Text style={styles.cruxLabel}>
                {crux?.hasProject ? "closest to the cemetery" : "arena empty"}
              </Text>
            </View>
            <View style={styles.spark}>
              {week.map((count, i) => (
                <View key={i} style={[styles.sparkBar, { height: Math.max(6, (count / weekMax) * 56) }]} />
              ))}
            </View>
          </View>
        </ChunkyCard>
      </Pressable>

      <Text style={styles.tagline}>Are we building, or just dreaming?</Text>
    </ScrollView>
  );
}

function ZoneHead({ icon, title, sub }: { icon: any; title: string; sub: string }) {
  return (
    <View style={styles.zoneHead}>
      <View style={styles.badge}>
        <MaterialCommunityIcons name={icon} size={26} color={colors.ink} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.zoneTitle}>{title.toUpperCase()}</Text>
        <Text style={styles.zoneSub}>{sub}</Text>
      </View>
    </View>
  );
}

function FilledSlot({ idea }: { idea: Idea }) {
  const left = daysLeftFor(idea);
  const { done, total } = progress(idea);
  const pct = total > 0 ? done / total : 0;
  return (
    <View style={styles.slot}>
      <View style={styles.slotTop}>
        <Text style={styles.slotName}>{idea.title}</Text>
        <View style={styles.ember}>
          <MaterialCommunityIcons name="fire" size={13} color={colors.coral} />
          <Text style={styles.emberText}>{left <= 0 ? "decision day" : `${left} days left`}</Text>
        </View>
      </View>
      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${Math.round(pct * 100)}%` }]} />
      </View>
    </View>
  );
}

function EmptySlot() {
  return (
    <View style={[styles.slot, styles.slotEmpty]}>
      <Text style={styles.slotEmptyText}>Empty slot. Promote an idea or it stays a daydream.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingVertical: 8 },
  wordmark: { fontFamily: fonts.display, fontSize: 27, lineHeight: 26, color: colors.gold },
  version: { fontFamily: fonts.mono, fontSize: 12, color: colors.boneDim },
  zoneHead: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  badge: { width: 46, height: 46, borderWidth: 2.5, borderColor: colors.ink, borderRadius: 12, backgroundColor: colors.bone, alignItems: "center", justifyContent: "center" },
  zoneTitle: { fontFamily: fonts.display, fontSize: 19, color: colors.ink },
  zoneSub: { fontFamily: fonts.mono, fontSize: 10.5, color: colors.ink, opacity: 0.7, marginTop: 4 },
  field: { backgroundColor: colors.bone, borderWidth: 2.5, borderColor: colors.ink, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 13, fontFamily: fonts.body, fontSize: 14, color: colors.ink, marginBottom: 12 },
  slot: { borderWidth: 2.5, borderColor: colors.ink, borderRadius: 13, backgroundColor: colors.bone, padding: 10, marginBottom: 10 },
  slotTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  slotName: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink, flexShrink: 1 },
  ember: { flexDirection: "row", alignItems: "center", gap: 4 },
  emberText: { fontFamily: fonts.monoBold, fontSize: 12, color: colors.coral },
  bar: { height: 9, borderWidth: 2, borderColor: colors.ink, borderRadius: 6, backgroundColor: "#E3DCC6", marginTop: 9, overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: colors.coral },
  slotEmpty: { backgroundColor: "transparent", borderStyle: "dashed", paddingVertical: 16 },
  slotEmptyText: { fontFamily: fonts.body, fontSize: 13, color: "#5A1F10", textAlign: "center" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: { fontFamily: fonts.monoBold, fontSize: 11, color: colors.ink, backgroundColor: colors.bone, borderWidth: 2.5, borderColor: colors.ink, borderRadius: 9, paddingVertical: 7, paddingHorizontal: 10 },
  crux: { flexDirection: "row", alignItems: "flex-end" },
  cruxBig: { fontFamily: fonts.display, fontSize: 30, color: colors.ink },
  cruxUnit: { fontSize: 15 },
  cruxLabel: { fontFamily: fonts.mono, fontSize: 10, color: colors.ink, opacity: 0.8, marginTop: 6 },
  spark: { flexDirection: "row", alignItems: "flex-end", gap: 5, height: 56 },
  sparkBar: { width: 11, backgroundColor: colors.ink, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  tagline: { fontFamily: fonts.mono, fontSize: 11, color: colors.boneDim, textAlign: "center", paddingVertical: 4 },
});
