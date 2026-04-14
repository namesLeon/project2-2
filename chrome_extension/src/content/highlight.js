/*
Main Writer:
Reviewer: 
Contributors: 
*/

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
      'borderLeftWidth', 'textAlign'
    ];
    propsToCopy.forEach(prop => {
      overlay.style[prop] = style[prop];
    });

    overlay.style.borderStyle = 'solid';
    overlay.style.borderColor = 'transparent';

    target.parentNode.style.position = 'relative';
    overlay.style.top = target.offsetTop + 'px';
    overlay.style.left = target.offsetLeft + 'px';

    target.parentNode.appendChild(overlay);

    target.addEventListener('scroll', () => {
      overlay.scrollTop = target.scrollTop;
      overlay.scrollLeft = target.scrollLeft;
    });
  }

  return overlay;
}
/*
Main Writer:
Reviewer: 
Contributors: 
*/

function updateHighlight(target, findings) {
  const overlay = createHighlight(target);
  const rawText = target.value || target.textContent;

  const sorted = [...findings].sort((a, b) => a.position - b.position);

  let htmlResult = '';
  let lastIndex = 0;

  sorted.forEach(({ value, position }) => {
    const plainPart = rawText.slice(lastIndex, position);
    
    htmlResult += escapeHTML(plainPart);
    htmlResult += `<span class="pii-highlight">${escapeHTML(value)}</span>`;
    
    lastIndex = position + value.length;
  });

  htmlResult += escapeHTML(rawText.slice(lastIndex));

  if (rawText.endsWith('\n')) {
    htmlResult += '\n';
  }

  overlay.innerHTML = htmlResult;

  overlay.scrollTop = target.scrollTop;
  overlay.scrollLeft = target.scrollLeft;
}

/*
Main Writer:
Reviewer: 
Contributors: 
*/

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}