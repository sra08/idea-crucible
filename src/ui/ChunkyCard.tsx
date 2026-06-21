// The sticker card. React Native's real shadows blur and differ across iOS and
// Android, so to get the crisp hard offset we draw an ink colored layer behind
// the card, shifted down and to the right. Identical on both platforms.

import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors, SHADOW_OFFSET, RADIUS } from "./theme";

interface Props {
  color: string; // one of the zone fills from theme.colors
  offset?: number;
  radius?: number;
  style?: ViewStyle;
  children: React.ReactNode;
}

export function ChunkyCard({
  color,
  offset = SHADOW_OFFSET,
  radius = RADIUS,
  style,
  children,
}: Props) {
  return (
    <View style={[styles.box, style]}>
      <View
        style={[
          styles.shadow,
          { left: offset, right: -offset, top: offset, bottom: -offset, borderRadius: radius },
        ]}
      />
      <View style={[styles.card, { backgroundColor: color, borderRadius: radius }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { position: "relative", marginBottom: 18 },
  shadow: { position: "absolute", backgroundColor: colors.ink },
  card: {
    borderWidth: 3,
    borderColor: colors.ink,
    padding: 14,
  },
});
