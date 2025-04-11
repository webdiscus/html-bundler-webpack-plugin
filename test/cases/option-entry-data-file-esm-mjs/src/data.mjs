// Note:
// Using .mjs for all sub-imported files forces Node to treat them all as ES modules, even in mixed projects.
// So no `default` wrapping occurs.

import { URL } from 'node:url'; // node
import company from './company.mjs';

const data = {
  company: {
    ...company,
    email: 'admin@awesomecorp.com', // override company.email
  },
  info: {
    url: new URL('https://awesomecorp.com/?query=demo'),
  },
};

export default data;
