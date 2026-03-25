// @see https://firebase.google.com/docs/web/setup#using_modular_sdk_with_metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('cjs');

// Firebase v9+ modular imports (firebase/auth, firebase/firestore, …)
config.resolver.unstable_enablePackageExports = true;

// Use browser/default bundles: some @firebase/* "react-native" entries point to
// missing files on certain installs; browser builds work in RN + Hermes.
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native', 'default'];

module.exports = config;
