// renders into HTML string
import headerTmpl from './header.pug?render';

// default mode is `compile`, compiles the template to the template function
import mainTmpl from './main.pug';

// test: render mode
// use it for partials which must not be rendered in runtime with external variables
document.getElementById('header').innerHTML = headerTmpl;

// test: default compile mode
// use it for partials which must be rendered in runtime with external variables
document.getElementById('main').innerHTML = mainTmpl({
  title: 'Test title',
  text: 'Hello World!',
});

console.log('>> main');
