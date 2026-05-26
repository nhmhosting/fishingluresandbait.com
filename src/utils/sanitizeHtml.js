/**
 * Sanitize HTML to only allow safe formatting tags.
 * Strips all tags except <b>, <u>, <strong>, <em>, <i>, <s>, <strike>, <br>.
 */
export function sanitizeHtml(html) {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const ALLOWED_TAGS = new Set(['B', 'U', 'STRONG', 'EM', 'I', 'S', 'STRIKE', 'BR']);

  function clean(node) {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.TEXT_NODE) continue;
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (!ALLOWED_TAGS.has(child.tagName)) {
          // Replace disallowed element with its children
          while (child.firstChild) {
            node.insertBefore(child.firstChild, child);
          }
          node.removeChild(child);
        } else {
          // Remove all attributes from allowed tags
          while (child.attributes.length > 0) {
            child.removeAttribute(child.attributes[0].name);
          }
          clean(child);
        }
      } else {
        node.removeChild(child);
      }
    }
  }

  clean(doc.body);
  return doc.body.innerHTML;
}
