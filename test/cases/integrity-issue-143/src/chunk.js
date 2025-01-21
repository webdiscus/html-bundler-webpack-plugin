const WELCOME_TEXT = 'Hello! The page title has been replaced';
const SELECTOR = 'h1';

export default function () {
  const h1 = document.querySelectorAll(SELECTOR);
  for (const title of Array.from(h1)) {
    title.innerHTML = WELCOME_TEXT;
  }
}
