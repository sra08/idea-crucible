import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors, fonts } from "./theme";
import { ModalFrame } from "./ModalFrame";
import { useNav } from "./nav";

import { getIdea } from "../store";
import { buryIdea, cprRevive, grantSabbatical } from "../engine";
import { MS_PER_DAY } from "../constants";
import { refreshWidget } from "../widget";
import { Idea } from "../types";

export function DecisionModal({ ideaId }: { ideaId: string }) {
  const nav = useNav();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    getIdea(ideaId).then((i) => setIdea(i ?? null));
  }, [ideaId]);

  if (!idea) return null;
  const firstTodo = idea.microTasks.find((t) => !t.done);

  const after = async (fn: () => Promise<unknown>) => {
    await fn();
    await refreshWidget();
    nav.bump();
    nav.closeModal();
  };

  return (
    <ModalFrame title="Decision time" accent={colors.gold} onClose={nav.closeModal}>
      <Text style={styles.idea}>{idea.title}</Text>
      <Text style={styles.prompt}>Are we executing, or are we dreaming?</Text>

      <Option
        icon="grave-stone"
        color={colors.coral}
        title="Bury it"
        body="Archive it to the cemetery. Out of sight, never deleted."
        onPress={() => after(() => buryIdea(idea.id))}
      />

      <Option
        icon="heart-pulse"
        color={colors.lime}
        title="Revive it now"
        body={
          firstTodo
            ? `Earn the extension: finish "${firstTodo.title}" right now. No free pass.`
            : "No unfinished tasks to do. Add one in the project first."
        }
        disabled={!firstTodo}
        onPress={() => firstTodo && after(() => cprRevive(idea.id, firstTodo.id))}
      />

      <Option
        icon="clock-outline"
        color={colors.teal}
        title="Sabbatical"
        body={
          idea.sabbaticalUsed
            ? "Already used. This idea has no sabbatical left."
            : "Right idea, wrong time. Hide it and it returns in 30 days."
        }
        disabled={idea.sabbaticalUsed}
        onPress={() =>
          after(() => grantSabbatical(idea.id, Date.now() + 30 * MS_PER_DAY)).catch(() =>
            setNote("Sabbatical unavailable.")
          )
        }
      />

      {note && <Text style={styles.error}>{note}</Text>}
    </ModalFrame>
  );
}

function Option({
  icon,
  color,
  title,
  body,
  onPress,
  disabled,
}: {
  icon: any;
  color: string;
  title: string;
  body: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={[styles.opt, { borderColor: color, opacity: disabled ? 0.45 : 1 }]}
      onPress={disabled ? undefined : onPress}
    >
      <MaterialCommunityIcons name={icon} size={26} color={color} />
      <View style={{ flex: 1 }}>
        <Text style={styles.optTitle}>{title.toUpperCase()}</Text>
        <Text style={styles.optBody}>{body}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  idea: { fontFamily: fonts.display, fontSize: 20, color: colors.bone, marginBottom: 6 },
  prompt: { fontFamily: fonts.mono, fontSize: 13, color: colors.gold, marginBottom: 18 },
  opt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  optTitle: { fontFamily: fonts.display, fontSize: 15, color: colors.bone },
  optBody: { fontFamily: fonts.body, fontSize: 13, color: colors.boneDim, marginTop: 3, lineHeight: 18 },
  error: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.coral, marginTop: 8 },
});
