const OVERLAY_ID = 'pii-detector-overlay';


/*
Main Writer:
Reviewer:
Contributors: Ashour Kariakous
*/

const IGNORE_STORAGE_KEY = 'pii-ignore-temp-list';

const replacements = {
  EMAIL: 'example@examplecompany.com',
  PHONE: '+1 (123) 456-7890',
  SSN: '123-45-6789',
  BSN: '123456789',
  CREDIT_CARD: '1234 5678 9012 3456',
  IBAN: 'AD12345678901234567890123456',
  VIN: '1HGBH41JXMN109186',
  DATE_OF_BIRTH: '01/01/1990',
  MAC_ADDRESS: '00:1A:2B:3C:4D:5E'
};

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
overlay.style.display = 'block';

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

/*
Main Writer: Ashour Kariakous
Reviewer:
Contributors: 
*/


    const redactBtn = document.createElement('button');
    redactBtn.textContent = 'Redact';
    redactBtn.className = 'redact';
    
    redactBtn.addEventListener('click', () => {
      const activeEl = window._lastPIITarget;
      if (!activeEl) return;
      if (activeEl.isContentEditable) {
        activeEl.textContent = activeEl.textContent.replaceAll(item.value, '[REDACTED]');
      } else {
        activeEl.value = activeEl.value.replaceAll(item.value, '[REDACTED]');
      }
      addIgnoredPII(item);
      activeEl.dispatchEvent(new Event('input', { bubbles: true })); 
    });

    const replaceBtn = document.createElement('button');
    replaceBtn.textContent = 'Replace';
    replaceBtn.className = 'replace';

    replaceBtn.addEventListener('click', () => {
      const activeEl = window._lastPIITarget;
      if (!activeEl) return;
      const placeholder = replacements[item.type] || '[REDACTED]';
      if (activeEl.isContentEditable) {
        activeEl.textContent = activeEl.textContent.replaceAll(item.value, placeholder);
      } else {
        activeEl.value = activeEl.value.replaceAll(item.value, placeholder);
      }
      addIgnoredPII(item);
      activeEl.dispatchEvent(new Event('input', { bubbles: true })); 
    });


    buttonContainer.appendChild(ignoreBtn);
    buttonContainer.appendChild(redactBtn);
    buttonContainer.appendChild(replaceBtn);

    row.appendChild(type);
    row.appendChild(value);
    row.appendChild(buttonContainer);

    list.appendChild(row);
  });

  overlay.style.display = 'block';
  overlay.style.zIndex = '999999999';
  overlay.style.position = 'fixed';
}
