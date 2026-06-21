import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, fonts } from "./theme";

interface Props {
  title: string;
  accent?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function ModalFrame({ title, accent = colors.gold, onClose, children }: Props) {
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.scrim}>
        <View style={[styles.sheet, { borderTopColor: accent }]}>
          <View style={styles.head}>
            <Text style={styles.title}>{title.toUpperCase()}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <MaterialCommunityIcons name="close" size={24} color={colors.bone} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: "rgba(10,20,20,0.55)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.screen,
    borderTopWidth: 5,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.bone },
});
