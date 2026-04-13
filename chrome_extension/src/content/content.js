let timeout; 

document.addEventListener('input', (e) => {
  clearTimeout(timeout);

  timeout = setTimeout(() => {
    const target = e.target;
    if (!target || !target.isContentEditable) return;

    const text = target.innerText;

    if (!text) {
      renderFindings([]);
      return;
    }

    const findings = detectPII(text);

    updateHighlight(target, findings);

    renderFindings(findings);
  }, 150);
}, true);

document.addEventListener('paste', (e) => {
  setTimeout(() => {
    const target = document.activeElement;
    if (!target || !target.isContentEditable) return;

    const text = target.innerText;
    const findings = detectPII(text);

    updateHighlight(target, findings);
    renderFindings(findings);
  }, 0);
});
