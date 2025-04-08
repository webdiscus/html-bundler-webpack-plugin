const company = require('./company.js');

module.exports = {
  company: {
    ...company(),
    email: 'admin@awesomecorp.com', // override company.email
  },
};
