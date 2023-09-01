const fs = require('fs');
const path = require('path');
const process = require('process');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const prepareWebpackConfig = (PATHS, relTestCasePath, webpackOpts = {}) => {
  const testPath = path.join(PATHS.testSource, relTestCasePath);
  const configFile = path.join(testPath, 'webpack.config.js');
  const commonConfigFile = path.join(PATHS.base, 'webpack.common.js');

  // change directory to current test folder, needed for the test default webpack output path
  process.chdir(testPath);

  if (!fs.existsSync(configFile)) {
    throw new Error(`The config file '${configFile}' not found for test: ${relTestCasePath}`);
  }

  const testConfig = require(configFile);
  const commonConfig = require(commonConfigFile);
  const baseConfig = {
    // the home directory for webpack should be the same where the tested webpack.config.js located
    context: testPath,
  };

  if (Array.isArray(testConfig)) {
    const finalConfig = [];

    testConfig.forEach((config) => {
      const commonConfig = require(commonConfigFile);

      // remove module rules in common config when custom rules are defined by test config or options
      if ((webpackOpts.module && webpackOpts.module.rules) || (config.module && config.module.rules)) {
        commonConfig.module.rules = [];
      }

      finalConfig.push(merge(baseConfig, commonConfig, webpackOpts, config));
    });

    return finalConfig;
  }

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
      compiler.close((closeErr) => {
        if (error) {
          reject('[webpack compiler]\n' + error.stack);
          return;
        }

        if (stats.hasErrors()) {
          reject('[webpack compiler stats]\n' + stats.toString());
          return;
        }
      });

      resolve(stats);
    });
  });

export const watch = (
  PATHS,
  testCasePath,
  webpackOpts,
  onWatch = (watching) => {
    watching.close((err) => {
      //console.log('Watching Ended.', { Error: err });
    });
  }
) =>
  new Promise((resolve, reject) => {
    let config;

    try {
      config = prepareWebpackConfig(PATHS, testCasePath, webpackOpts);
    } catch (error) {
      reject('[webpack watch prepare config] ' + error.toString());
      return;
    }

    const compiler = webpack(config);
    const watching = compiler.watch({ aggregateTimeout: 100, poll: undefined }, (error, stats) => {
      if (error) {
        reject('[webpack watch] ' + error);
        watching.close();
        return;
      }

      if (stats.hasErrors()) {
        reject('[webpack watch stats] ' + stats.toString());
        watching.close();
        return;
      }

      if (typeof onWatch === 'function') {
        onWatch(watching);
      }

      resolve(stats);
    });
  });
