// Webpack 5.112 moved these constants into lib/module.
let modulePath;
try {
  modulePath = require.resolve('webpack/lib/ModuleTypeConstants');
} catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
  modulePath = require.resolve('webpack/lib/module/ModuleTypeConstants');
}

module.exports = require(modulePath);
