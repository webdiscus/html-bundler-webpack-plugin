const Handlebars = require('handlebars');
// test the helper with namespace `wrapper/span`
module.exports = (options) => new Handlebars.SafeString(`<span>${options.fn(this)}</span>`);
