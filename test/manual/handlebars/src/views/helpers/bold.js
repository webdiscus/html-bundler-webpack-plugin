const Handlebars = require('handlebars');
module.exports = (options) => new Handlebars.SafeString(`<strong>${options.fn(this)}</strong>`);
