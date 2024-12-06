import tmpl from './app.hbs';

const locals1 = {
  firstName: 'Max',
  lastName: 'Pain',
  age: 21,
  driverLicenseA: true,
  driverLicenseB: true,
};

// test the rendering with different variables set,
// the variables from previous definition must not be cached
const locals2 = {
  firstName: 'Walter',
  //lastName: 'White', // the value of undefined variable must not be used from previous definition
  age: 50,
  driverLicenseB: true,
};

let html = tmpl(locals1);
html += tmpl(locals2);

document.getElementById('main').innerHTML = html;

console.log('>> app');
