const piiPatterns = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  PHONE: /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
  SSN: /\b(?!000|666)[0-9]{3}-(?!00)[0-9]{2}-(?!0000)[0-9]{4}\b/g,
  CREDIT_CARD: /\b(?:\d[ -]*?){13,19}\b/g
};

const OVERLAY_ID = 'pii-detector-overlay';
const INLINE_OVERLAY_CLASS = 'pii-inline-highlight';

// -------------------- Inline Highlighting --------------------
function highlightInlinePII(element, findings) {
  if (!element || findings.length === 0) return;

  // Prevent infinite loop
  if (element.dataset.highlighting === 'true') return;
  element.dataset.highlighting = 'true';

  // Remove old highlights
  element.querySelectorAll(`.${INLINE_OVERLAY_CLASS}`).forEach(span => {
    span.replaceWith(span.textContent);
  });

  let html = element.innerHTML;

  findings.forEach(({ value }) => {
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    html = html.replace(
      regex,
      `<span class="${INLINE_OVERLAY_CLASS}">${value}</span>`
    );
  });

  element.innerHTML = html;
  element.dataset.highlighting = 'false';
}

// -------------------- Sidebar Overlay --------------------
function ensureOverlay() {
  let overlay = document.getElementById(OVERLAY_ID);
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.style.position = 'fixed';
  overlay.style.top = '12px';
  overlay.style.right = '12px';
  overlay.style.width = '260px';
  overlay.style.maxHeight = '220px';
  overlay.style.overflowY = 'auto';
  overlay.style.padding = '10px';
  overlay.style.borderRadius = '8px';
  overlay.style.background = 'rgba(17, 24, 39, 0.92)';
  overlay.style.color = '#f9fafb';
  overlay.style.fontFamily = 'Arial, sans-serif';
  overlay.style.fontSize = '12px';
  overlay.style.lineHeight = '1.4';
  overlay.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.25)';
  overlay.style.zIndex = '2147483647';
  overlay.style.display = 'none';

  const title = document.createElement('div');
  title.textContent = 'Potential PII Found';
  title.style.fontWeight = '700';
  title.style.marginBottom = '8px';

  const list = document.createElement('div');
  list.id = `${OVERLAY_ID}-list`;

  overlay.appendChild(title);
  overlay.appendChild(list);
  document.documentElement.appendChild(overlay);

  return overlay;
}

function renderFindings(findings) {
  const overlay = ensureOverlay();
  const list = document.getElementById(`${OVERLAY_ID}-list`);
  if (!list) return;

  if (!findings.length) {
    overlay.style.display = 'none';
    list.replaceChildren();
    return;
  }

  const uniqueFindings = [];
  const seen = new Set();
  for (const item of findings) {
    const key = `${item.type}:${item.value}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueFindings.push(item);
    }
  }

  list.replaceChildren();
  uniqueFindings.slice(0, 12).forEach((item) => {
    const row = document.createElement('div');
    row.style.marginBottom = '6px';

    const type = document.createElement('strong');
    type.textContent = `${item.type}: `;

    const value = document.createElement('span');
    value.textContent = item.value;

    row.appendChild(type);
    row.appendChild(value);
    list.appendChild(row);
  });

  overlay.style.display = 'block';
}

// -------------------- PII Detection --------------------
function detectPII(text) {
  const findings = [];
  for (const [type, regex] of Object.entries(piiPatterns)) {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      findings.push({
        type,
        value: match[0],
        position: match.index
      });
    }
  }
  return findings;
}

// -------------------- Event Listener --------------------
document.addEventListener('input', (e) => {
  const target = e.target;

  // Text from input / contenteditable
  const text = target.value || target.textContent;
  if (!text) {
    renderFindings([]);
    return;
  }

  const findings = detectPII(text);

  // Render sidebar overlay
  renderFindings(findings);

  // Inline highlighting (works for contenteditable only)
  if (target.isContentEditable) {
    highlightInlinePII(target, findings);
  }

  if (findings.length > 0) {
    console.log('PII found:', findings);
  }
}, true);