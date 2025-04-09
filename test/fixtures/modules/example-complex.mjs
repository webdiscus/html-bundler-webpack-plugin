import { URL } from 'node:url';

//export const message = 'Hello from ESM';

const url = new URL('https://example.com');

console.log('export url.hostname: ', url.hostname);

// Using loadModuleAsync (load data without cache) the export must be an object.
export default {
  obj: { foo: 'bar', bar: 'baz' },
  date: new Date('2025-04-08T16:08:39.369Z'),
  url: new URL('https://example.com'),
  isNaN: (num) => Number.isNaN(num),
};
