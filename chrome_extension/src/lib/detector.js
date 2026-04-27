/*
Main Writer: Andreas Constantinou
Reviewer:
Contributors:
*/

const piiPatterns = {
  //Detects email on top level domains
  EMAIL: /[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.(?:com|org|net|edu|gov|mil|int|co|io|co\.uk|us|ca|de|au|fr|jp|com\.tr|cn|in|br|ru|it|es|pl|mx|za|nl|se|ch|be|no|fi|dk|kr|gr|pt|hu|at|cz|sk|lt|lv|bg|ro|az|hk|tw|ae|sa|il|tr)/g,

  PHONE: /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/g,

  SSN: /\b(?!000|666)[0-9]{3}-(?!00)[0-9]{2}-(?!0000)[0-9]{4}\b/g,

  //Nothing before or after the 9 digits
  BSN: /(?<!\d)\d{9}(?!\d)/g,

  CREDIT_CARD: /\b(?:\d[ -]*?){13,19}\b/g,

  //All possible two letter combinations for countries plus 11-32 letter and number ending
  IBAN: /\b(?:AD|AE|AL|AT|AZ|BA|BE|BG|BH|BR|BY|CH|CR|CY|CZ|DE|DK|DO|EE|EG|ES|FI|FO|FR|GB|GE|GI|GL|GR|GT|HR|HU|IE|IL|IQ|IS|IT|JO|KW|KZ|LB|LC|LI|LT|LU|LV|MC|MD|ME|MK|MR|MT|MU|MZ|NL|NO|PK|PL|PS|PT|QA|RO|RS|SA|SC|SE|SI|SK|SM|ST|SV|TL|TN|TR|UA|VA|VG|XK)\d{2}[A-Z0-9]{11,32}\b/g,

  //Vin(vehicle identification number) number(17 char) does not include I,O,Q
  VIN: /\b[A-HJ-NPR-Z0-9]\b/g,

  //Date of birth dd/mm/yy or dd/mm/yyyy
  DATE_OF_BIRTH: /(?<!\d)(0[1-9]|[12]\d|3[01])[\/.-](0[1-9]|1[0-2])[\/.-](?:(?:19|20)\d{2}|\d{2})(?!\d)/g,

  //Detects MAC addresses ,six groups of two hexadecimal digits (0-9, A-F, a-f)
  MAC_ADDRESS: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/g
};

/*
Main Writer: Andreas Constantinou
Reviewer: Piotr
Contributors:
*/

function detectPII(text) {
  const findings = [];
  for (const [type, regex] of Object.entries(piiPatterns)) {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      findings.push({
        type,
        value: match[0],
        position: match.index,
      });
    }
  }
  return findings;
}
