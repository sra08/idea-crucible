import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors, fonts } from "./theme";
import { ScreenTitle } from "./ScreenTitle";
import { useNav } from "./nav";

import { getSettings, saveSettings } from "../store";
import { addNagWindow, removeNagWindow } from "../index";
import { Settings } from "../types";

const PRESETS: { label: string; hour: number; minute: number }[] = [
  { label: "Morning", hour: 8, minute: 0 },
  { label: "Lunch", hour: 13, minute: 0 },
  { label: "Evening", hour: 19, minute: 30 },
];

export function ProfileScreen() {
  const nav = useNav();
  const [settings, setSettings] = useState<Settings | null>(null);

  const reload = useCallback(async () => setSettings(await getSettings()), []);
  useEffect(() => {
    reload();
  }, [reload, nav.version]);

  if (!settings) return null;

  const setIntensity = async (intensity: Settings["nagIntensity"]) => {
    const next = { ...settings, nagIntensity: intensity };
    await saveSettings(next);
    setSettings(next);
  };

  const add = async (p: (typeof PRESETS)[number]) => {
    await addNagWindow(p.label, p.hour, p.minute);
    nav.bump();
    reload();
  };

  const remove = async (id: string) => {
    await removeNagWindow(id);
    nav.bump();
    reload();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.screen }} contentContainerStyle={styles.scroll}>
      <ScreenTitle>Profile</ScreenTitle>

      <Text style={styles.section}>NAG TONE</Text>
      <View style={styles.toggleRow}>
        {(["gentle", "blunt"] as const).map((opt) => {
          const on = settings.nagIntensity === opt;
          return (
            <Pressable
              key={opt}
              style={[styles.toggle, on && styles.toggleOn]}
              onPress={() => setIntensity(opt)}
            >
              <Text style={[styles.toggleText, on && styles.toggleTextOn]}>{opt.toUpperCase()}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.section, { marginTop: 24 }]}>NAG WINDOWS</Text>
      {settings.nagWindows.length === 0 && <Text style={styles.muted}>No windows yet. Add one below.</Text>}
      {settings.nagWindows.map((w) => (
        <View key={w.id} style={styles.windowRow}>
          <MaterialCommunityIcons name="bell-outline" size={18} color={colors.teal} />
          <Text style={styles.windowText}>
            {w.label} {String(w.hour).padStart(2, "0")}:{String(w.minute).padStart(2, "0")}
          </Text>
          <Pressable onPress={() => remove(w.id)} hitSlop={8}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.coral} />
          </Pressable>
        </View>
      ))}

      <View style={styles.presetRow}>
        {PRESETS.map((p) => (
          <Pressable key={p.label} style={styles.preset} onPress={() => add(p)}>
            <MaterialCommunityIcons name="plus" size={16} color={colors.ink} />
            <Text style={styles.presetText}>
              {p.label} {String(p.hour).padStart(2, "0")}:{String(p.minute).padStart(2, "0")}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.note}>
        Windows fire a daily reminder. On some Android phones you may need to exempt the app from
        battery optimization so reminders are not delayed.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  section: { fontFamily: fonts.mono, fontSize: 12, color: colors.boneDim, letterSpacing: 0.5, marginBottom: 10 },
  muted: { fontFamily: fonts.body, fontSize: 14, color: colors.boneDim },
  toggleRow: { flexDirection: "row", gap: 12 },
  toggle: { flex: 1, borderWidth: 2.5, borderColor: colors.bone, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  toggleOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  toggleText: { fontFamily: fonts.display, fontSize: 13, color: colors.bone },
  toggleTextOn: { color: colors.ink },
  windowRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 11, borderBottomWidth: 1.5, borderBottomColor: "rgba(245,240,225,0.12)" },
  windowText: { fontFamily: fonts.monoBold, fontSize: 14, color: colors.bone, flex: 1 },
  presetRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  preset: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.teal, borderWidth: 2.5, borderColor: colors.ink, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 },
  presetText: { fontFamily: fonts.monoBold, fontSize: 11, color: colors.ink },
  note: { fontFamily: fonts.mono, fontSize: 11, color: colors.boneDim, lineHeight: 18, marginTop: 24 },
});
