import React, { useEffect } from "react";
import { View, Platform, StatusBar, StyleSheet } from "react-native";

import { colors } from "./theme";
import { useNav } from "./nav";
import { BottomNav } from "./BottomNav";
import { HomeScreen } from "./HomeScreen";
import { CrucibleScreen } from "./CrucibleScreen";
import { HistoryScreen } from "./HistoryScreen";
import { ProfileScreen } from "./ProfileScreen";
import { PromoteModal } from "./PromoteModal";
import { ProjectModal } from "./ProjectModal";
import { DecisionModal } from "./DecisionModal";

import { loadState } from "../store";
import { activeArenaIdeas, isAtDecisionPoint } from "../arena";

export function AppShell() {
  const nav = useNav();

  useEffect(() => {
    loadState().then((s) => {
      const due = activeArenaIdeas(s).find((i) => isAtDecisionPoint(i));
      if (due) nav.openDecision(due.id);
    });
  }, []);

  return (
    <View style={styles.root}>
      <View style={{ flex: 1 }}>
        {nav.tab === "home" && <HomeScreen />}
        {nav.tab === "crucible" && <CrucibleScreen />}
        {nav.tab === "history" && <HistoryScreen />}
        {nav.tab === "profile" && <ProfileScreen />}
      </View>

      <BottomNav />

      {nav.modal?.type === "promote" && <PromoteModal />}
      {nav.modal?.type === "project" && <ProjectModal ideaId={nav.modal.ideaId} />}
      {nav.modal?.type === "decision" && <DecisionModal ideaId={nav.modal.ideaId} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.screen,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0,
  },
});
