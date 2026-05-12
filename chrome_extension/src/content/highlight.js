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
      'borderLeftWidth', 'textAlign' , 'overflowWrap' , 'overflow','textTransform'
    ];
    propsToCopy.forEach(prop => {
      overlay.style[prop] = style[prop];
    });

    overlay.style.borderStyle = 'solid';
    overlay.style.borderColor = 'transparent';

    target.parentNode.style.position = 'relative';

    overlay.style.top = target.offsetTop + 'px';
    overlay.style.left = target.offsetLeft + 'px';
    overlay.style.width = target.offsetWidth + 'px';
    overlay.style.height = target.offsetHeight + 'px';

    overlay.style.whiteSpace = 'pre-wrap';
    overlay.style.wordBreak = 'break-word';
    overlay.style.overflowWrap = 'break-word';
    overlay.style.position = 'absolute';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '1';
    overlay.style.color = 'transparent';
    overlay.style.font = style.font;
    overlay.style.letterSpacing = style.letterSpacing;
    overlay.style.lineHeight = style.lineHeight;

 

    target.parentNode.appendChild(overlay);

    target.addEventListener('scroll', () => {
      overlay.scrollTop = target.scrollTop;
      overlay.scrollLeft = target.scrollLeft;
    });
  }

  return overlay;
}
function getTextAndMap(node) {
  let text = '';
  const map = [];

  function walk(n) {
    if (n.nodeType === Node.TEXT_NODE) {
      for (let i = 0; i < n.textContent.length; i++) {
        map.push({ node: n, offset: i });
      }
      text += n.textContent;
    } else if (n.nodeName === 'BR') {
      map.push({ node: n, offset: 0 });
      text += '\n';
    } else if (n.nodeName === 'DIV' || n.nodeName === 'P') {
      if (text.length > 0) {
        map.push(null);
        text += '\n';
      }
      for (const child of n.childNodes) walk(child);
    } else {
      for (const child of n.childNodes) walk(child);
    }
  }

  walk(node);
  return { text, map };
}

function updateHighlight(target, findings) {
  const overlay = createHighlight(target);
  const { text: rawText } = getTextAndMap(target);

  const sorted = [...findings].sort((a, b) => a.position - b.position);

  let html = '';
  let lastIndex = 0;

  sorted.forEach(({ value, position }) => {
    html += escapeHTMLWithBreaks(rawText.slice(lastIndex, position));
    html += `<span class="pii-highlight">${escapeHTMLWithBreaks(value)}</span>`;
    lastIndex = position + value.length;
  });

  html += escapeHTMLWithBreaks(rawText.slice(lastIndex));
  overlay.innerHTML = html;
  overlay.scrollTop = target.scrollTop;
  overlay.scrollLeft = target.scrollLeft;
}

function escapeHTMLWithBreaks(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br>");
}