const OVERLAY_ID = 'pii-detector-overlay';

/*
Main Writer:
Reviewer:
Contributors:
*/

const IGNORE_STORAGE_KEY = 'pii-ignore-temp-list';

function getIgnoredPII() {
  const data = sessionStorage.getItem(IGNORE_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function setIgnoredPII(list) {
  sessionStorage.setItem(IGNORE_STORAGE_KEY, JSON.stringify(list));
}

function addIgnoredPII(item) {
  const ignored = getIgnoredPII();
  const key = `${item.type}:${item.value}`;

  if (!ignored.includes(key)) {
    ignored.push(key);
    setIgnoredPII(ignored);
  }
}

function isIgnored(item) {
  const ignored = getIgnoredPII();
  const key = `${item.type}:${item.value}`;
  return ignored.includes(key);
}

function ensureOverlay() {
  let overlay = document.getElementById(OVERLAY_ID);
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  overlay.style.position = 'fixed';

  const title = document.createElement('div');
  title.textContent = 'Potential PII Found';
  title.style.fontWeight = '700';
  title.style.marginBottom = '8px';

  const list = document.createElement('div');
  list.id = `${OVERLAY_ID}-list`;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'pii-close-btn';
  closeBtn.innerHTML = '&times;';

  closeBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
  });

  overlay.appendChild(closeBtn);

  overlay.appendChild(title);
  overlay.appendChild(list);

  document.documentElement.appendChild(overlay);

  return overlay;
}

function renderFindings(findings) {
  const overlay = ensureOverlay();
  const list = document.getElementById(`${OVERLAY_ID}-list`);
  if (!list) return;

  const filteredFindings = findings.filter(item => !isIgnored(item));

  if (!filteredFindings.length) {
    overlay.style.display = 'none';
    list.replaceChildren();
    return;
  }

  const uniqueFindings = [];
  const seen = new Set();

  for (const item of filteredFindings) {
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

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'pii-actions';

    const ignoreBtn = document.createElement('button');
    ignoreBtn.textContent = 'Ignore';
    ignoreBtn.className = 'ignore';

    ignoreBtn.addEventListener('click', () => {
      addIgnoredPII(item);
      renderFindings(findings);
    });

    const redactBtn = document.createElement('button');
    redactBtn.textContent = 'Redact';
    redactBtn.className = 'redact';

    const replaceBtn = document.createElement('button');
    replaceBtn.textContent = 'Replace';
    replaceBtn.className = 'replace';

    buttonContainer.appendChild(ignoreBtn);
    buttonContainer.appendChild(redactBtn);
    buttonContainer.appendChild(replaceBtn);

    row.appendChild(type);
    row.appendChild(value);
    row.appendChild(buttonContainer);

    list.appendChild(row);
  });

  overlay.style.display = 'block';
}