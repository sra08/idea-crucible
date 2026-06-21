// The widget UI. These are NOT regular React Native components. FlexWidget and
// TextWidget come from react-native-android-widget and compile down to native
// Android RemoteViews, which is why the styling options are limited compared to
// a normal screen.

import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { WidgetVM } from "./widgetView";

const BG = "#16151A";
const ACCENT = "#F0653C"; // warm, slightly urgent
const MUTED = "#8A8794";
const TEXT = "#FFFFFF";

export function StreakWidget({ vm }: { vm: WidgetVM }) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: BG,
        borderRadius: 24,
        padding: 16,
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {vm.hasProject ? (
        <FlexWidget style={{ flexDirection: "column", width: "match_parent" }}>
          <TextWidget
            text={vm.daysLeft <= 0 ? "DECISION DAY" : `${vm.daysLeft} days left`}
            style={{ fontSize: 26, fontWeight: "bold", color: vm.daysLeft <= 3 ? ACCENT : TEXT }}
          />
          <TextWidget
            text={vm.title}
            maxLines={1}
            style={{ fontSize: 15, color: TEXT, marginTop: 4 }}
          />
          <TextWidget
            text={`${vm.daysSince} days untouched  ·  ${vm.doneCount}/${vm.totalCount} done`}
            style={{ fontSize: 12, color: MUTED, marginTop: 8 }}
          />
        </FlexWidget>
      ) : (
        <FlexWidget style={{ flexDirection: "column", width: "match_parent" }}>
          <TextWidget text="Arena empty" style={{ fontSize: 20, fontWeight: "bold", color: TEXT }} />
          <TextWidget
            text="Tap to promote an idea"
            style={{ fontSize: 13, color: MUTED, marginTop: 6 }}
          />
        </FlexWidget>
      )}

      <TextWidget
        text="Are we building or just dreaming?"
        style={{ fontSize: 11, color: MUTED }}
      />
    </FlexWidget>
  );
}
