/*
Main Writer: Andreas Constantinou
Reviewer: Piotr
Contributors:
*/

let timeout;

document.addEventListener('input', (e) => {
  const target = e.target;
  if (!target) return;

  const text = target.value || target.textContent;
  if (!text) {
    renderFindings([]);
    return;
  }

  const findings = detectPII(text);

  if (target.isContentEditable) {
    updateHighlight(target, findings);
  }

  renderFindings(findings);

  if (findings.length > 0) {
    console.log('PII found:', findings);
    // redactSensitiveData(target, findings); // DO NOT REDACT UNLESS REDACT BUTTON WAS PRESSED
  }
}, true);

/*
Main Writer: Ashour Kariakous
Reviewer: Andreas Constantinou
Contributors:
*/

document.addEventListener('keyup', (e) => {
  const target = e.target;
  if (!target || !target.isContentEditable) return;
  const { text } = getTextAndMap(target);
  if (!text || !text.trim()) {
    renderFindings([]);
    const overlay = target.parentNode.querySelector('.pii-overlay');
    if (overlay) overlay.innerHTML = '';
  }
}, true);
