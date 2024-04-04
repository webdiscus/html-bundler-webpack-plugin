import cssUrl from './style-dynamic.scss?url';

// universal way
function lazyLoad(url) {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = url;
  document.head.appendChild(style);
  console.log('lazyLoad: ', { cssUrl });
}

// Using fetch and document.adoptedStyleSheets
// Browser compatibility (since early 2023):
// https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets#browser_compatibility

// modern way, using promise
function lazyLoad2(url) {
  fetch(url).then((response) => {
    response.text().then((css) => {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      document.adoptedStyleSheets = [sheet];
      console.log('lazyLoad2: ', { cssUrl });
    });
  });
}

// modern way, using async await
async function lazyLoad3(url) {
  const response = await fetch(url);
  const css = await response.text();
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css);
  document.adoptedStyleSheets = [sheet];
  console.log('lazyLoad3: ', { cssUrl });
}

//lazyLoad(cssUrl);
//lazyLoad2(cssUrl);
lazyLoad3(cssUrl);
