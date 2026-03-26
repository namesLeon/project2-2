const piiPatterns = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  PHONE: /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
  SSN: /\b(?!000|666)[0-9]{3}-(?!00)[0-9]{2}-(?!0000)[0-9]{4}\b/g,
  CREDIT_CARD: /\b(?:\d[ -]*?){13,19}\b/g
};

function detectPII(text) {
  const findings = [];
  for (const [type, regex] of Object.entries(piiPatterns)) {
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

document.addEventListener('input', (e) => {
  const text = e.target.value || e.target.textContent;
  if (!text) return;
  
  const findings = detectPII(text);
  if (findings.length > 0) {
    console.log('PII found:', findings);
  }
}, true);
