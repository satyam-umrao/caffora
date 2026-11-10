const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(process.cwd());

module.exports = withNativeWind(config, {
  input: "./global.css",
});
