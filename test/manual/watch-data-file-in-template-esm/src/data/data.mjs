import company from './company.js';

class Company {
  constructor(company) {
    this.company = company;
  }

  get name() {
    return this.company.name;
  }

  getName() {
    return this.company.name;
  }
}

// console.log('#company :', company);

const data = {
  company: {
    ...company,
    email: 'admin@awesomecorp.com', // override company.email
  },
  Company: new Company(company),
  info: {
    url: new URL('https://awesomecorp.com/?query=demo'),
    date: new Date(),
  },
  test: {
    ArrayBuffer: new ArrayBuffer(8),
    Uint8Array: new Uint8Array([10, 20, 30]),
    Float64Array: new Float64Array([1.1, 2.2]),
    error: new TypeError('Boom!'),
    fnIncrement: function (x) {
      return x + 1;
    },
    Set: new Set(['abc 12345', 1, { x: 123 }]),
    Map: new Map([
      ['a', 1],
      ['b', { c: 2 }],
    ]),
    buffer: { buffer: Buffer.from('hello') },
    sym: { sym: Symbol('my-symbol') },
    RegExp: { test: /abc\d+/gi },
    //cjs: require('./test.cjs'), // require is not defined in ES module scope
  },
};

export default data;
