'use strict';

const Handlebars = require('handlebars');

// custom helpers

const bold = function (options) {
  return new Handlebars.SafeString(`<b>${options.fn(this)}</b>`);
};

const italic = function (options) {
  return new Handlebars.SafeString(`<i>${options.fn(this)}</i>`);
};

const toUpperCase = function (content) {
  return content.toUpperCase();
};

// test never used helper
const unused = function () {
  return 'UNUSED-HELPER: should not be included into JS-template';
};

export default {
  bold,
  italic,
  toUpperCase,
  unused,
};
