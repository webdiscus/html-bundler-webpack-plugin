import tmpl1 from './widget.pug?render';
import tmpl2 from './widget.pug?render&a=10';
import tmpl3 from './widget.pug?render&a=20&b=abc';

document.getElementById('root').innerHTML = tmpl1 + tmpl2 + tmpl3;
console.log('>> main');
