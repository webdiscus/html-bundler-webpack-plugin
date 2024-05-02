// inline imported style
import './a.scss';

const elm = document.querySelector('.component-a');
elm.innerText += ' [inlined]';

console.log('>> component a');
