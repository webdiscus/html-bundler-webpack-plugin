const Handlebars = require('handlebars');
module.exports = (options) => new Handlebars.SafeString(`<i>: ${options.fn(this)}</i>`);
