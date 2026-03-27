const OVERLAY_ID = 'pii-detector-overlay';

function ensureOverlay() {
  let overlay = document.getElementById(OVERLAY_ID);
  if (overlay) return overlay;
  
  overlay = document.createElement('div');
  overlay.id = OVERLAY_ID

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