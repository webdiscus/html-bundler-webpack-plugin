const { lorem, libA, libB } = require('@test-fixtures/js');
const modA = require('./module-a');
const modC = require('./module-c');

console.log('>> main-a:');
console.log(' - A: ', modA);
console.log(' - C: ', modC);
console.log('Lorem: ', lorem.getTitle());
