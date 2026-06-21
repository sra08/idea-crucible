import React from "react";
import { Text, StyleSheet } from "react-native";
import { colors, fonts } from "./theme";

export function ScreenTitle({ children }: { children: string }) {
  return <Text style={styles.title}>{children.toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.gold, paddingVertical: 10 },
});
