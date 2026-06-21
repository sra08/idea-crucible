import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors, fonts } from "./theme";
import { ChunkyButton } from "./ChunkyButton";
import { ModalFrame } from "./ModalFrame";
import { useNav } from "./nav";

import { loadState } from "../store";
import { promoteToArena, ArenaFullError } from "../engine";
import { generateMicroSteps, localMicroSteps } from "../microsteps";
import { refreshWidget } from "../widget";
import { ANTHROPIC_API_KEY } from "../config";
import { Idea } from "../types";

export function PromoteModal() {
  const nav = useNav();
  const [sandbox, setSandbox] = useState<Idea[]>([]);
  const [selected, setSelected] = useState<Idea | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadState().then((s) => setSandbox(s.ideas.filter((i) => i.status === "sandbox")));
  }, []);

  const pick = async (idea: Idea) => {
    setSelected(idea);
    setError(null);
    setBusy(true);
    try {
      const generated = ANTHROPIC_API_KEY
        ? await generateMicroSteps(idea.title, idea.notes, { apiKey: ANTHROPIC_API_KEY })
        : localMicroSteps(idea.title);
      setSteps(generated.length ? generated : localMicroSteps(idea.title));
    } catch {
      setSteps(localMicroSteps(idea.title));
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    if (!selected) return;
    try {
      await promoteToArena(selected.id, steps);
      await refreshWidget();
      nav.bump();
      nav.closeModal();
    } catch (e) {
      if (e instanceof ArenaFullError) {
        setError("Both Arena slots are full. Finish or shelf a project to free one.");
      } else {
        setError("Something went wrong. Try again.");
      }
    }
  };

  return (
    <ModalFrame title="Send to the Arena" accent={colors.coral} onClose={nav.closeModal}>
      {sandbox.length === 0 && !selected && (
        <Text style={styles.note}>Nothing in the sandbox yet. Jot an idea on the home screen first.</Text>
      )}

      {!selected &&
        sandbox.map((idea) => (
          <Pressable key={idea.id} style={styles.row} onPress={() => pick(idea)}>
            <Text style={styles.rowText}>{idea.title}</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.boneDim} />
          </Pressable>
        ))}

      {selected && (
        <View>
          <Text style={styles.selected}>{selected.title}</Text>
          <Text style={styles.subhead}>FIRST MICRO TASKS</Text>
          {busy ? (
            <ActivityIndicator color={colors.gold} style={{ marginVertical: 16 }} />
          ) : (
            steps.map((s, i) => (
              <View key={i} style={styles.stepRow}>
                <MaterialCommunityIcons name="circle-small" size={22} color={colors.gold} />
                <Text style={styles.stepText}>{s}</Text>
              </View>
            ))
          )}
          {error && <Text style={styles.error}>{error}</Text>}
          <View style={{ height: 12 }} />
          {!busy && <ChunkyButton label="Send it" onPress={send} />}
        </View>
      )}
    </ModalFrame>
  );
}

const styles = StyleSheet.create({
  note: { fontFamily: fonts.body, fontSize: 14, color: colors.boneDim, lineHeight: 22 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.bone,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 12,
    padding: 13,
    marginBottom: 10,
  },
  rowText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink, flexShrink: 1 },
  selected: { fontFamily: fonts.display, fontSize: 18, color: colors.bone, marginBottom: 10 },
  subhead: { fontFamily: fonts.mono, fontSize: 11, color: colors.boneDim, letterSpacing: 0.5, marginBottom: 8 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  stepText: { fontFamily: fonts.body, fontSize: 14, color: colors.bone, flex: 1, lineHeight: 20 },
  error: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.coral, marginTop: 10 },
});
