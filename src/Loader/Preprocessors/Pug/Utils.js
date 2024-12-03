const { labelInfo, labelWarn, labelError } = require('../../Utils');

const loaderName = 'html-bundler:preprocessor:pug';

module.exports = {
  loaderName,
  labelInfo: (label) => labelInfo(loaderName, label),
  labelWarn: (label) => labelWarn(loaderName, label),
  labelError: (label) => labelError(loaderName, label),
};
