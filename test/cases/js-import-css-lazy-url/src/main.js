import cssUrl from './style-dynamic.scss?url';

function lazyLoad(url) {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = url;
  document.head.appendChild(style);
}

console.log('cssFile: ', { cssUrl });
lazyLoad(cssUrl);
// - OR -
//lazyLoad(require('./style-dynamic.scss?url'));
