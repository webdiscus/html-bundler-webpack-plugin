const image = require('@images/apple.png');

document.addEventListener('DOMContentLoaded', (event) => {
  const elm = document.querySelector('.js-image-script-inline-true');
  elm.style.backgroundImage = `url(${image})`;
  elm.style.width = '160px';
  elm.style.height = '130px';
  elm.style.border = '5px solid greenyellow';
});

console.log('>> script-inline-true.js?inline=true', { image });
