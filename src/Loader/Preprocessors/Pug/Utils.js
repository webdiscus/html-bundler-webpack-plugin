const { red, green, yellow } = require('ansis');

const loaderName = 'pug-loader';
const labelInfo = (label) => `\n${green`[${loaderName}${label ? ':' + label : ''}]`}`;
const labelWarn = (label) => `\n${yellow`[${loaderName}${label ? ':' + label : ''}]`}`;
const labelError = (label) => `\n${red`[${loaderName}${label ? ':' + label : ''}]`}`;

module.exports = {
  loaderName,
  labelInfo,
  labelWarn,
  labelError,
};
