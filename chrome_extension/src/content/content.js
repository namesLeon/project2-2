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
  }
}, true);

document.addEventListener('paste', (e) => {
  setTimeout(() => {
    const target = e.target;
    const text = target.value || target.textContent;
    const findings = detectPII(text);
    if (target.isContentEditable) updateHighlight(target, findings);
    renderFindings(findings);
  }, 0);
});