import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors, fonts } from "./theme";
import { ScreenTitle } from "./ScreenTitle";
import { useNav } from "./nav";
import { loadState } from "../store";
import { Idea } from "../types";

function fmt(ts: number | null): string {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString();
}

export function HistoryScreen() {
  const nav = useNav();
  const [buried, setBuried] = useState<Idea[]>([]);
  const [sabbatical, setSabbatical] = useState<Idea[]>([]);

  useEffect(() => {
    loadState().then((s) => {
      setBuried(s.ideas.filter((i) => i.status === "cemetery"));
      setSabbatical(s.ideas.filter((i) => i.status === "sabbatical"));
    });
  }, [nav.version]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.screen }} contentContainerStyle={styles.scroll}>
      <ScreenTitle>History</ScreenTitle>

      <Text style={styles.section}>ON SABBATICAL</Text>
      {sabbatical.length === 0 && <Text style={styles.muted}>Nothing resting.</Text>}
      {sabbatical.map((i) => (
        <View key={i.id} style={styles.row}>
          <MaterialCommunityIcons name="clock-outline" size={20} color={colors.teal} />
          <Text style={styles.name}>{i.title}</Text>
          <Text style={styles.meta}>back {fmt(i.repitchAt)}</Text>
        </View>
      ))}

      <Text style={[styles.section, { marginTop: 22 }]}>THE CEMETERY</Text>
      {buried.length === 0 && <Text style={styles.muted}>Empty. Nothing buried yet.</Text>}
      {buried.map((i) => (
        <View key={i.id} style={styles.row}>
          <MaterialCommunityIcons name="grave-stone" size={20} color={colors.boneDim} />
          <Text style={styles.name}>{i.title}</Text>
          <Text style={styles.meta}>{fmt(i.buriedAt)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  section: { fontFamily: fonts.mono, fontSize: 12, color: colors.boneDim, letterSpacing: 0.5, marginBottom: 10 },
  muted: { fontFamily: fonts.body, fontSize: 14, color: colors.boneDim },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1.5, borderBottomColor: "rgba(245,240,225,0.12)" },
  name: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.bone, flex: 1 },
  meta: { fontFamily: fonts.mono, fontSize: 11, color: colors.boneDim },
});
