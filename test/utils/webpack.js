const fs = require('fs');
const path = require('path');
const process = require('process');
const webpack = require('webpack');
const { loadModuleAsync } = require('../../src/Common/FileUtils');
const { outToConsole } = require('../../src/Common/Helpers');
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

  const commonConfig = require(commonConfigFile);

  return loadModuleAsync(configFile).then((testConfig) => {
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
  });
};

/**
 * @param {{}} PATHS
 * @param {string} testCasePath
 * @param {{}} webpackOpts
 * @return {Promise<unknown>}
 */
export const compile = async (PATHS, testCasePath, webpackOpts) => {
  let config;

  try {
    config = await prepareWebpackConfig(PATHS, testCasePath, webpackOpts);
  } catch (error) {
    throw new Error('[webpack prepare config] ' + error.toString());
  }

  // create the webpack compiler with the resolved config
  const compiler = webpack(config);

  return new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (typeof config.stats === 'string') {
        let preset = config.stats;
        config.stats = { preset };
      }

      if (!error) {
        // display stats info in the output,
        // because if webpack API is used, nothing is displayed
        const statsOutput = stats.toString(config.stats);
        if (statsOutput) {
          outToConsole(statsOutput);
        }
      }

      compiler.close((closeErr) => {
        if (error) {
          reject('[webpack compiler]\n' + error.stack);
          return;
        }

        if (stats.hasErrors()) {
          reject('[webpack compiler stats]\n' + stats.toString());
          return;
        }

        resolve(stats); // successful compilation
      });
    });
  });
};

export const watch = async (
  PATHS,
  testCasePath,
  webpackOpts,
  onWatch = (watching) => {
    watching.close((err) => {
      // console.log('Watching Ended.', { Error: err });
    });
  }
) => {
  let config;

  try {
    config = await prepareWebpackConfig(PATHS, testCasePath, webpackOpts);
  } catch (error) {
    throw new Error('[webpack watch prepare config] ' + error.toString());
  }

  const compiler = webpack(config);

  return new Promise((resolve, reject) => {
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
};
