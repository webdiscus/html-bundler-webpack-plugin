//import Handlebars from 'handlebars'; // not works!
const Handlebars = require('handlebars');

export const h1 = function (options) {
  return new Handlebars.SafeString(`<h1>${options.fn(this)}</h1>`);
};

export const italic = function (options) {
  return new Handlebars.SafeString(`<i>${options.fn(this)}</i>`);
};
