const scriptsWithIntegrity = [];

const observer = new MutationObserver((mutationsList) => {
  Array.from(mutationsList).forEach((mutation) => {
    Array.from(mutation.addedNodes || []).forEach((node) => {
      if (node.nodeName === 'SCRIPT') {
        if (
          node.getAttribute('crossOrigin') === 'anonymous' &&
          !!node.getAttribute('integrity').match(/^sha384-[-A-Za-z0-9+/=]{64}$/)
        ) {
          scriptsWithIntegrity.push(node);
        }
      }
    });
  });
});

observer.observe(document.querySelector('head'), { childList: true });

import('./chunk')
  .then(() => {
    if (
      scriptsWithIntegrity.some((script) => {
        console.log('>> load chunk: ', {
          src: script.getAttribute('src'),
          integrity: script.getAttribute('integrity'),
        });
        return new URL(script.getAttribute('src')).pathname.endsWith('/src_chunk_js.js');
      })
    ) {
      console.log('>> chunk is loaded ');
    } else {
      console.log('error');
    }
  })
  .catch((e) => {
    console.error(e);
    console.log('import error');
  });

console.log('>> main');
