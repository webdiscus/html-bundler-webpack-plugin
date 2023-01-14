import { addTwoNumbers } from './lib';

// test compilation of source script via Webpack before it will be inlined in html
console.log('>> inline script from inline-main.js', addTwoNumbers(3, 4));