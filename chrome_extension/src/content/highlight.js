function createHighlight(target) {
  let overlay = target.parentNode.querySelector('.pii-overlay');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'pii-overlay';

    const style = getComputedStyle(target);
    overlay.style.width = style.width;
    overlay.style.height = style.height;
    overlay.style.font = style.font;
    overlay.style.padding = style.padding;
    overlay.style.margin = style.margin;
    overlay.style.lineHeight = style.lineHeight;

    target.parentNode.style.position = 'relative';
    target.parentNode.appendChild(overlay);
  }

  return overlay;
}

function updateHighlight(target, findings) {
  const overlay = createHighlight(target);
  let text = target.value || target.textContent;

  const sorted = [...findings].sort((a, b) => b.position - a.position);

  sorted.forEach(({ value, position }) => {
    const before = text.slice(0, position);
    const after = text.slice(position + value.length);

    text = `${before}<span class="pii-highlight">${value}</span>${after}`;
  });

  text = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

    .replace(/&lt;span class="pii-highlight"&gt;/g, '<span class="pii-highlight">')
    .replace(/&lt;\/span&gt;/g, '</span>');
  overlay.innerHTML = text;
}