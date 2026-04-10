const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
// The core package is in a sibling directory: ../packages/core
const coreRoot = path.resolve(projectRoot, '../packages/core');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// Add the shared core package to the watch list
config.watchFolders = [projectRoot, coreRoot];

// Ensure the resolver finds the core package and its own node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(coreRoot, 'node_modules'),
];

module.exports = config;
