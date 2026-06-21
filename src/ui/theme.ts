// The single source of truth for the Idea Crucible look. Every screen and
// component pulls from here so the style stays consistent.

export const colors = {
  ink: "#16302F", // forge ink: background, outlines, text on bright fills
  screen: "#1F3D3B", // app screen background
  nav: "#284B49", // bottom nav bar
  gold: "#F4B63F", // molten gold: wordmark + crucible zone
  coral: "#EC6142", // ember coral: the arena
  lime: "#B6D94C", // kiln lime: the sandbox
  teal: "#54C7C2", // steel teal: the nag bot
  bone: "#F5F0E1", // paper / input fields
  boneDim: "#C9CBBE", // muted text on dark
  fieldText: "#5D6B5A", // placeholder text on bone
};

// Font family names as registered by the @expo-google-fonts packages.
export const fonts = {
  display: "ArchivoBlack_400Regular", // chunky uppercase: wordmark, titles, buttons
  body: "SpaceGrotesk_400Regular",
  bodyBold: "SpaceGrotesk_700Bold",
  mono: "SpaceMono_400Regular", // counters, chips, meta
  monoBold: "SpaceMono_700Bold",
};

// The hard offset that gives cards and buttons their sticker pop.
export const SHADOW_OFFSET = 5;
export const BUTTON_OFFSET = 3;
export const RADIUS = 20;
