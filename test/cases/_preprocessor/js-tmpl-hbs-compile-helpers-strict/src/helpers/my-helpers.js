'use strict';

const Handlebars = require('handlebars');

// Open/close tag helpers

const bold = function (options) {
  return new Handlebars.SafeString(`<b>${options.fn(this)}</b>`);
};

const italic = function (options) {
  return new Handlebars.SafeString(`<i>${options.fn(this)}</i>`);
};

// Self-closed tag helpers

// usage: {{getFirstChars 'some text' len="3"}}
const getFirstChars = function (content, options) {
  if (typeof content !== 'string') return '';

  const len = options.hash.len || content.length;
  let out = content.slice(0, len);

  return new Handlebars.SafeString(out);
};

// test the helper with complex code
const complexHelper = function (content, options) {
  let out = '';

  // comment
  const escapeHTML = (str) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const SEP = /(\s|&nbsp;|<br\s*\/?>)+/gi;
  const parts = content.split(SEP).filter(Boolean);
  const lastWord = parts.pop() || '';
  const firstPart = parts.join('');

  if (!firstPart.trim()) {
    out = `<p class="title">${escapeHTML(lastWord)}</p>`;
  } else {
    out =
      `<p class="title">` +
      `${firstPart}` +
      `<span class="inline-flex">` +
      `${escapeHTML(lastWord)}` +
      `</span>` +
      `</p>`;
  }

  return new Handlebars.SafeString(out);
};

// test helper as arrow function
const trim = (content, options) => {
  let out = content;
  out = out.trim();
  return new Handlebars.SafeString(out);
};

export default {
  bold,
  italic,
  getFirstChars,
  complexHelper,
  trim,
};
