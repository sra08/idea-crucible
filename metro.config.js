// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Inject our DOMException polyfill as the very first thing in the bundle,
// before React Native's own environment setup runs.
const defaultGetPolyfills = config.serializer.getPolyfills
  ? config.serializer.getPolyfills
  : () => [];

config.serializer.getPolyfills = ({ platform }) => {
  const defaults =
    typeof defaultGetPolyfills === 'function'
      ? defaultGetPolyfills({ platform })
      : [];
  return [
    require.resolve('./polyfills/domexception.js'),
    ...defaults,
  ];
};

// Tell Metro to transpile react-native's private source files and all Expo packages
// through Babel so our babel.config.js plugins can downlevel private class fields.
config.transformer.transformIgnorePatterns = [
  'node_modules/(?!(react-native|expo|@expo|@unimodules|unimodules|react-native-android-widget|@react-native|expo-dev-client|expo-modules-core|expo-notifications|expo-font|expo-splash-screen|expo-status-bar|@react-native-async-storage)/)',
];

module.exports = config;
