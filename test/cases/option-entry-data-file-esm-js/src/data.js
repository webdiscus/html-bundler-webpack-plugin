import company from './company.js';

const data = {
  company: {
    ...company,
    email: 'admin@awesomecorp.com', // override company.email
  },
};

export default data;
