let timeout; 

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

document.addEventListener('input', (e) => {
  clearTimeout(timeout);
  const target = e.target;
  if (!target || !target.isContentEditable) return;

  const overlay = target.parentNode.querySelector('.pii-overlay');
  if (overlay) overlay.innerHTML = '';

  const { text: immediateText } = getTextAndMap(target);
  if (!immediateText || !immediateText.trim()) {
    renderFindings([]);
    return;
  }

  timeout = setTimeout(() => {
    const { text } = getTextAndMap(target);
    if (!text || !text.trim()) {
      renderFindings([]);
      const overlay = target.parentNode.querySelector('.pii-overlay');
      if (overlay) overlay.innerHTML = '';
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
    const { text } = getTextAndMap(target);
    if (!text || !text.trim()) {
      renderFindings([]);
      const overlay = target.parentNode.querySelector('.pii-overlay');
      if (overlay) overlay.innerHTML = '';
      return;
    }
    const findings = detectPII(text);
    updateHighlight(target, findings);
    renderFindings(findings);
  }, 0);
});