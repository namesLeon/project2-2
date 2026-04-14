let textMemory = "";

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
    redactSensitiveData(target, findings);
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

function redactSensitiveData(inputElement, findings) {
  let text;

  if (inputElement.isContentEditable)
    text = inputElement.textContent;
  else
    text = inputElement.value;

  textMemory = text;
  for (const item of findings)
    text = text.replaceAll(item.value, "[REDACTED]");

  if(inputElement.isContentEditable)
    inputElement.textContent = text;
  else
    inputElement.value = text;
}

/*document.addEventListener('keydown', (e) => {
  if(e.key == "Backspace" && textMemory != "") {
    const target = e.target;
    const currentText = target.isContentEditable ? target.textContent : target.value;

    if (currentText.includes("[REDACTED]")) {
      e.preventDefault();

      const restoredText = textMemory.slice(0, -1);

      if (target.isContentEditable)
        target.textContent = restoredText;
      else
        target.value = restoredText;

      textMemory = "";
    }
  }
}, true);*/