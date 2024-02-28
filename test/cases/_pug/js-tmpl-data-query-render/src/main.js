// test: render mode
import headerTmpl from './header.pug?render';

// test: render mode and pass external variables into template via URL parameters
import mainTmpl from './main.pug?render&title=Test%20title&text=Hello%20World%21';

// test: render mode, compiles the template to the HTML string
document.getElementById('header').innerHTML = headerTmpl;

// test: render mode, compiles the template to the HTML string
document.getElementById('main').innerHTML = mainTmpl;

console.log('>> main');
