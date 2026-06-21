// The push down button. On press the ink shadow disappears and the face slides
// into its spot, so the button feels like it physically depresses.

import React, { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { colors, fonts, BUTTON_OFFSET } from "./theme";

interface Props {
  label: string;
  onPress?: () => void;
  offset?: number;
}

export function ChunkyButton({ label, onPress, offset = BUTTON_OFFSET }: Props) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={styles.box}
    >
      {!pressed && (
        <View
          style={[styles.shadow, { left: offset, right: -offset, top: offset, bottom: -offset }]}
        />
      )}
      <View
        style={[
          styles.face,
          pressed && { transform: [{ translateX: offset }, { translateY: offset }] },
        ]}
      >
        <Text style={styles.label}>{label.toUpperCase()}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { position: "relative", alignSelf: "flex-end" },
  shadow: { position: "absolute", backgroundColor: colors.ink, borderRadius: 11 },
  face: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
    borderWidth: 2.5,
    borderRadius: 11,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  label: { color: colors.bone, fontFamily: fonts.display, fontSize: 12, letterSpacing: 0.3 },
});
