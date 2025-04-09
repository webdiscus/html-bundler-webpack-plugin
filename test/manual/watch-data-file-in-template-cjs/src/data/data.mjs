import company from './company.js';

// TODO: fix deserializer of a class using loadModuleAsync without cache

class Company {
  constructor(company) {
    this.company = company;
  }

  get name() {
    console.log('instCompany.name: ', this.company);
    return this.company.name;
  }

  getName() {
    console.log('instCompany.getName(): ', this.company);
    return this.company.name;
  }
}

// console.log('#company :', company);

const data = {
  company: {
    ...company,
    email: 'admin@awesomecorp.com 2456', // override company.email
  },
  Company: new Company(company),
  info: {
    url: new URL('https://awesomecorp.com/?query=demo'),
    date: new Date(),
  },
};

export default data;
