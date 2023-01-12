const fs = require('fs');
const path = require('path');
const process = require('process');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const prepareWebpackConfig = (PATHS, relTestCasePath, webpackOpts = {}) => {
  const testPath = path.join(PATHS.testSource, relTestCasePath),
    configFile = path.join(testPath, 'webpack.config.js'),
    commonConfigFile = path.join(PATHS.base, 'webpack.common.js');

  // change directory to current test folder, needed for test default webpack output path
  process.chdir(testPath);

  if (!fs.existsSync(configFile)) {
    throw new Error(`The config file '${configFile}' not found for test: ${relTestCasePath}`);
  }

  let baseConfig = {
      // the home directory for webpack should be the same where the tested webpack.config.js located
      context: testPath,
      output: {
        // clean the output directory before emit
        clean: true,
      },
    },
    testConfig = require(configFile),
    commonConfig = require(commonConfigFile);

  // remove module rules in common config when custom rules are defined by test config or options
  if ((webpackOpts.module && webpackOpts.module.rules) || (testConfig.module && testConfig.module.rules)) {
    commonConfig.module.rules = [];
  }

  return merge(baseConfig, commonConfig, webpackOpts, testConfig);
};

export const compile = (PATHS, testCasePath, webpackOpts) =>
  new Promise((resolve, reject) => {
    let config;

    try {
      config = prepareWebpackConfig(PATHS, testCasePath, webpackOpts);
    } catch (error) {
      reject('[webpack prepare config] ' + error.toString());
      return;
    }

    const compiler = webpack(config);
    compiler.run((error, stats) => {
      if (error) {
        reject('[webpack compiler] ' + error);
        return;
      }

      if (stats.hasErrors()) {
        reject('[webpack compiler stats] ' + stats.toString());
        return;
      }

      resolve(stats);
    });
  });