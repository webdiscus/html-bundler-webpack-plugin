// imported style will be inlined into HTML
import './a.scss';

const elm = document.querySelector('.component-a');
elm.innerText = 'Inlined component';

console.log('>> component a');
