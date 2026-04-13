function createHighlight(target) {
  let overlay = target.parentNode.querySelector('.pii-overlay');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'pii-overlay';

    const style = getComputedStyle(target);
    
    const propsToCopy = [
      'width', 'height', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'wordSpacing',
      'lineHeight', 'boxSizing', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth',
      'borderLeftWidth', 'textAlign' , 'overflowWrap' , 'overflow','textTransform'
    ];
    propsToCopy.forEach(prop => {
      overlay.style[prop] = style[prop];
    });

    overlay.style.borderStyle = 'solid';
    overlay.style.borderColor = 'transparent';

    target.parentNode.style.position = 'relative';

    const rect = target.getBoundingClientRect();
    const parentRect = target.parentNode.getBoundingClientRect();
    
    overlay.style.top = (rect.top - parentRect.top) + 'px';
    overlay.style.left = (rect.left - parentRect.left) + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';

    overlay.style.whiteSpace = 'pre-wrap';
    overlay.style.wordBreak = 'break-word';
    overlay.style.overflowWrap = 'break-word';
    overlay.style.position = 'absolute';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '1';
    overlay.style.color = 'transparent';

    if (style.lineHeight === 'normal') {
      overlay.style.lineHeight = '1.2'; 
    }

    target.parentNode.appendChild(overlay);

    target.addEventListener('scroll', () => {
      overlay.scrollTop = target.scrollTop;
      overlay.scrollLeft = target.scrollLeft;
    });
  }

  return overlay;
}

function updateHighlight(target, findings) {
  const overlay = createHighlight(target);
  const rawText = target.innerText;
  const rect = target.getBoundingClientRect();

  let html = escapeHTML(rawText);

  findings.forEach(({ value }) => {
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi'); // <-- case insensitive
    html = html.replace(regex, `<span class="pii-highlight">${escapeHTML(value)}</span>`);
  });

  overlay.innerHTML = html;
  overlay.style.width = rect.width + 'px';
  overlay.style.height = rect.height + 'px';

  // sync scroll ONLY
  overlay.scrollTop = target.scrollTop;
  overlay.scrollLeft = target.scrollLeft;
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}