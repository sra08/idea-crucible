// App entry component. Loads the three custom fonts (the look depends on them),
// starts the engine, and renders the app inside the nav provider.

import React, { useEffect } from "react";
import { useFonts, ArchivoBlack_400Regular } from "@expo-google-fonts/archivo-black";
import { SpaceGrotesk_400Regular, SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";
import { SpaceMono_400Regular, SpaceMono_700Bold } from "@expo-google-fonts/space-mono";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import { NavProvider } from "./src/ui/nav";
import { AppShell } from "./src/ui/AppShell";
import { initEngine } from "./src";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded] = useFonts({
    ArchivoBlack_400Regular,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_700Bold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  useEffect(() => {
    initEngine();
  }, []);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <NavProvider>
      <StatusBar style="light" />
      <AppShell />
    </NavProvider>
  );
}
