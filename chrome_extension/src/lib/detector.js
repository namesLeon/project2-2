const piiPatterns = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  PHONE: /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
  SSN: /\b(?!000|666)[0-9]{3}-(?!00)[0-9]{2}-(?!0000)[0-9]{4}\b/g,
  BSN: /\b\d{9}\b/g,
  CREDIT_CARD: /\b(?:\d[ -]*?){13,19}\b/g,
  IBAN: /\b[A-Z]{2}\d{2}[A-Z0-9]{4,30}\b/g
};

function detectPII(text) {
  const findings = [];
  for (const [type, regex] of Object.entries(piiPatterns)) {
    regex.lastIndex = 0;
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
