import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, fonts } from "./theme";
import { TabKey, useNav } from "./nav";

const TABS: { key: TabKey; icon: any; label: string }[] = [
  { key: "home", icon: "home-variant-outline", label: "Home" },
  { key: "crucible", icon: "fire", label: "Crucible" },
  { key: "history", icon: "book-open-variant", label: "History" },
  { key: "profile", icon: "account-outline", label: "Profile" },
];

export function BottomNav() {
  const { tab, setTab } = useNav();
  return (
    <View style={styles.nav}>
      {TABS.map((t) => {
        const active = tab === t.key;
        return (
          <Pressable key={t.key} style={styles.tab} onPress={() => setTab(t.key)}>
            <MaterialCommunityIcons
              name={t.icon}
              size={22}
              color={active ? colors.gold : colors.boneDim}
            />
            <Text style={[styles.label, { color: active ? colors.gold : colors.boneDim }]}>
              {t.label.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    backgroundColor: colors.nav,
    borderTopWidth: 3,
    borderTopColor: colors.ink,
    paddingVertical: 10,
    paddingBottom: 14,
  },
  tab: { flex: 1, alignItems: "center", gap: 4 },
  label: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 0.5 },
});
