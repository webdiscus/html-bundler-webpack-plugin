const scriptsWithIntegrity = [];
const observer = new MutationObserver((mutations) => {
  for (const { addedNodes: nodes = [] } of mutations) {
    for (const node of nodes) {
      if (node.nodeName === 'SCRIPT' && !!node.getAttribute('integrity')) {
        scriptsWithIntegrity.push(node);
      }
    }
  }
});

observer.observe(document.querySelector('head'), { childList: true });

import('./chunk')
  .then(() => {
    scriptsWithIntegrity.forEach((script) => {
      const { src, integrity, crossOrigin } = script;
      let file = src.split('/').pop();
      const elm = document.createElement('p');
      const msg = `Dynamic chunk "${file}" is loaded!`;
      elm.innerHTML = `<h2>${msg}</h2><div><b>integrity:</b> ${integrity}</div><div><b>crossOrigin</b>: ${crossOrigin}</div>`;
      document.body.append(elm);
      console.log(`--> ${msg}`, script);
    });
  })
  .catch((e) => {
    console.log('import chunk error: ', e);
  });

import './main.css';

console.log('>> main');
