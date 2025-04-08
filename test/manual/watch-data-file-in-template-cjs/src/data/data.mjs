import company from './company.js';

console.log(company());

const data = {
  company: {
    ...company(),
    email: 'admin@awesomecorp.com', // override company.email
  },
};

export default data;
