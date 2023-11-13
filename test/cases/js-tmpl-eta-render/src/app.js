import html from './partials/header.html?render';

const domNode = document.getElementById('header');
domNode.innerHTML = html;

console.log('>> app');
