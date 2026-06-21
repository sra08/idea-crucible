import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors, fonts } from "./theme";
import { ChunkyButton } from "./ChunkyButton";
import { ModalFrame } from "./ModalFrame";
import { useNav } from "./nav";

import { getIdea } from "../store";
import { completeMicroTask, buryIdea, grantSabbatical } from "../engine";
import { daysSinceExecution } from "../arena";
import { DECISION_DAY, MS_PER_DAY } from "../constants";
import { refreshWidget } from "../widget";
import { Idea } from "../types";

export function ProjectModal({ ideaId }: { ideaId: string }) {
  const nav = useNav();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const reload = useCallback(async () => setIdea((await getIdea(ideaId)) ?? null), [ideaId]);
  useEffect(() => {
    reload();
  }, [reload]);

  if (!idea) return null;

  const since = daysSinceExecution(idea) ?? 0;
  const left = Math.max(0, Math.ceil(DECISION_DAY - since));

  const toggle = async (taskId: string, done: boolean) => {
    if (done) return;
    await completeMicroTask(idea.id, taskId);
    await refreshWidget();
    nav.bump();
    reload();
  };

  const bury = async () => {
    await buryIdea(idea.id);
    await refreshWidget();
    nav.bump();
    nav.closeModal();
  };

  const sabbatical = async () => {
    try {
      await grantSabbatical(idea.id, Date.now() + 30 * MS_PER_DAY);
      await refreshWidget();
      nav.bump();
      nav.closeModal();
    } catch {
      setNote("This idea already used its one sabbatical.");
    }
  };

  return (
    <ModalFrame title={idea.title} accent={colors.coral} onClose={nav.closeModal}>
      <Text style={styles.timer}>
        {left <= 0 ? "Decision day reached" : `${left} days until the cemetery`}
      </Text>

      <Text style={styles.subhead}>MICRO TASKS</Text>
      {idea.microTasks.length === 0 && <Text style={styles.note}>No micro tasks yet.</Text>}
      {idea.microTasks.map((t) => (
        <Pressable key={t.id} style={styles.task} onPress={() => toggle(t.id, t.done)}>
          <MaterialCommunityIcons
            name={t.done ? "checkbox-marked" : "checkbox-blank-outline"}
            size={22}
            color={t.done ? colors.lime : colors.ink}
          />
          <Text style={[styles.taskText, t.done && styles.taskDone]}>{t.title}</Text>
        </Pressable>
      ))}

      <Text style={styles.hint}>Checking one off resets the 14 day clock. That is the only thing that does.</Text>

      {note && <Text style={styles.error}>{note}</Text>}

      <View style={styles.actions}>
        <Pressable style={styles.ghost} onPress={sabbatical}>
          <MaterialCommunityIcons name="clock-outline" size={18} color={colors.bone} />
          <Text style={styles.ghostText}>SABBATICAL</Text>
        </Pressable>
        <Pressable style={[styles.ghost, { borderColor: colors.coral }]} onPress={bury}>
          <MaterialCommunityIcons name="grave-stone" size={18} color={colors.coral} />
          <Text style={[styles.ghostText, { color: colors.coral }]}>BURY IT</Text>
        </Pressable>
      </View>
    </ModalFrame>
  );
}

const styles = StyleSheet.create({
  timer: { fontFamily: fonts.monoBold, fontSize: 13, color: colors.coral, marginBottom: 16 },
  subhead: { fontFamily: fonts.mono, fontSize: 11, color: colors.boneDim, letterSpacing: 0.5, marginBottom: 10 },
  note: { fontFamily: fonts.body, fontSize: 14, color: colors.boneDim },
  task: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.bone,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  taskText: { fontFamily: fonts.body, fontSize: 14, color: colors.ink, flex: 1 },
  taskDone: { textDecorationLine: "line-through", color: colors.fieldText },
  hint: { fontFamily: fonts.mono, fontSize: 11, color: colors.boneDim, lineHeight: 18, marginTop: 4 },
  error: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.coral, marginTop: 12 },
  actions: { flexDirection: "row", gap: 12, marginTop: 18 },
  ghost: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    borderWidth: 2.5,
    borderColor: colors.bone,
    borderRadius: 12,
    paddingVertical: 12,
  },
  ghostText: { fontFamily: fonts.display, fontSize: 12, color: colors.bone },
});
