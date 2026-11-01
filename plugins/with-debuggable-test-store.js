// Marks the Android app as debuggable (android:debuggable="true" in the
// manifest) when RC_TEST_STORE_DEBUGGABLE=1 is set at build time.
//
// Why: the RevenueCat SDK deliberately crashes when a Test Store API key is
// used in a non-debuggable Android build. The React Native SDK does not expose
// `forceAllowTestStoreInReleaseBuilds`, so standalone test builds (the EAS
// `preview` profile) use this flag instead. Only the manifest flag changes:
// BuildConfig.DEBUG stays false, so the JS bundle is still embedded and React
// Native does not look for a Metro dev server.
//
// Never set RC_TEST_STORE_DEBUGGABLE for production builds.
const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withDebuggableTestStore(config) {
  if (process.env.RC_TEST_STORE_DEBUGGABLE !== '1') {
    return config;
  }
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    manifest.$['xmlns:tools'] = manifest.$['xmlns:tools'] || 'http://schemas.android.com/tools';
    const app = manifest.application?.[0];
    if (app) {
      app.$['android:debuggable'] = 'true';
      const ignored = (app.$['tools:ignore'] || '').split(',').filter(Boolean);
      if (!ignored.includes('HardcodedDebugMode')) ignored.push('HardcodedDebugMode');
      app.$['tools:ignore'] = ignored.join(',');
    }
    return cfg;
  });
};
