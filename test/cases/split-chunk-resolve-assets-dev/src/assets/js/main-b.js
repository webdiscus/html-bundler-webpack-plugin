const { lorem, libA, libB } = require('@test-fixtures/js');
const modB = require('./module-b');
const modC = require('./module-c');

console.log('>> main-b:');
console.log(' - B: ', modB);
console.log(' - C: ', modC);
console.log('Lorem: ', lorem.getTitle());
