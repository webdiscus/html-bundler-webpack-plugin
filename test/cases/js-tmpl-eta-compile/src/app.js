import tmpl from './partials/header.html?lang=en';

// Note: Eta does not support passing variables to the client-side template function.
const html = tmpl();

const domNode = document.getElementById('header');
domNode.innerHTML = html;

console.log('>> app');
