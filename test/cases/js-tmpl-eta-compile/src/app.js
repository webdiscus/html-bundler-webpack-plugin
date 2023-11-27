import tmpl from './partials/header.html?lang=en';

// Note: Eta does not support passing variables to the client-side template function.
const html = tmpl();

document.getElementById('header').innerHTML = html;

console.log('>> app');
