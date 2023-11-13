import tmpl from './template.html?name=ES Module';

const appContainer = document.getElementById('app-esm');
appContainer.innerHTML = tmpl();
