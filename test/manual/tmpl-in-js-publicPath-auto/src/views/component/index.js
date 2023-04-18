import tmpl from './template.html?name=World';
import image from './stern.svg';

console.log('>> image public path: ', image);

const appContainer = document.getElementById('app');
appContainer.innerHTML = tmpl;
