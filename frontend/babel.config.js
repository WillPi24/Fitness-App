// Babel config for Helm. In production builds, strip console.log /
// console.info / console.debug / console.trace from the JS bundle so the
// app doesn't leak request URLs, user IDs, or response bodies via
// `adb logcat` / Console.app. We keep `console.error` and `console.warn`
// so crash diagnostics still surface (and so a future Sentry / crash-
// reporting integration can capture them).
module.exports = function (api) {
  api.cache(true);
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    presets: ['babel-preset-expo'],
    plugins: isProduction
      ? [['transform-remove-console', { exclude: ['error', 'warn'] }]]
      : [],
  };
};
