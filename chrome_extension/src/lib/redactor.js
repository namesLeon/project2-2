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
