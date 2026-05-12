/*
Main Writer: Andreas Constantinou
Reviewer: Piotr
Contributors:
*/

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
    // redactSensitiveData(target, findings); // DO NOT REDACT UNLESS REDACT BUTTON WAS PRESSED
  }
}, true);

/*
Main Writer: Andreas Constantinou
Reviewer:
Contributors:
*/

document.addEventListener('paste', (e) => {
  setTimeout(() => {
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
  }, 0);
});

/*
Main Writer: Alex
Reviewer:
Contributors: Andreas Constantinou
*/

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

