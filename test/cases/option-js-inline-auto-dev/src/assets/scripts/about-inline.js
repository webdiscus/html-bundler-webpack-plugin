const image = require('@images/kiwi.png');

document.addEventListener('DOMContentLoaded', (event) => {
  const elm = document.querySelector('.js-kiwi');
  elm.style.backgroundImage = `url(${image})`;
  elm.style.width = '160px';
  elm.style.height = '130px';
  elm.style.border = '5px solid green';
});

console.log('>> about inline', { image });
