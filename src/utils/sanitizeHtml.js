const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'code',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'a',
]);

const ALLOWED_ATTRS = {
  a: new Set(['href', 'target', 'rel']),
};

function sanitizeTree(root) {
  const childElements = Array.from(root.children || []);

  for (const element of childElements) {
    sanitizeTree(element);

    const tagName = element.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tagName)) {
      const fragment = document.createDocumentFragment();
      while (element.firstChild) {
        fragment.appendChild(element.firstChild);
      }
      element.replaceWith(fragment);
      continue;
    }

    for (const attr of Array.from(element.attributes)) {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on') || name === 'style') {
        element.removeAttribute(attr.name);
        continue;
      }

      const allowedForTag = ALLOWED_ATTRS[tagName];
      if (!allowedForTag || !allowedForTag.has(name)) {
        element.removeAttribute(attr.name);
      }
    }

    if (tagName === 'a') {
      const href = (element.getAttribute('href') || '').trim().toLowerCase();
      const safeHref =
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('/') ||
        href.startsWith('#');

      if (!safeHref) {
        element.removeAttribute('href');
      }

      if (element.getAttribute('target') === '_blank') {
        element.setAttribute('rel', 'noopener noreferrer');
      }
    }
  }
}

export function sanitizeRichHtml(input = '') {
  if (typeof document === 'undefined') {
    return String(input ?? '');
  }

  const template = document.createElement('template');
  template.innerHTML = String(input ?? '');
  sanitizeTree(template.content);
  return template.innerHTML;
}

export function htmlToPlainText(input = '') {
  if (typeof document === 'undefined') {
    return String(input ?? '');
  }

  const safeHtml = sanitizeRichHtml(input);
  const container = document.createElement('div');
  container.innerHTML = safeHtml;
  return container.textContent || '';
}

