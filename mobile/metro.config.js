const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json', 'mjs', 'cjs'];

const rootModules = path.resolve(projectRoot, 'node_modules');

const extraNodeModules = {};
if (fs.existsSync(rootModules)) {
  for (const entry of fs.readdirSync(rootModules)) {
    const full = path.join(rootModules, entry);
    if (fs.statSync(full).isDirectory() || fs.lstatSync(full).isSymbolicLink()) {
      extraNodeModules[entry] = full;
    }
  }
}

config.resolver.extraNodeModules = extraNodeModules;
config.resolver.nodeModulesPaths = [rootModules];

module.exports = config;
