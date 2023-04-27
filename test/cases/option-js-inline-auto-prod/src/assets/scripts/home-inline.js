const image = require('@images/melon.png');

document.addEventListener('DOMContentLoaded', (event) => {
  const elm = document.querySelector('.js-melon');
  elm.style.backgroundImage = `url(${image})`;
  elm.style.width = '160px';
  elm.style.height = '130px';
  elm.style.border = '5px solid orangered';
});

console.log('>> home inline', { image });
