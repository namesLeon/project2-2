## Code Structure

```
├─ chrome_extension
│  ├─ background.js
│  ├─ content
│  │  ├─ content.js
│  │  ├─ highlight.js
│  │  └─ overlay.js
│  ├─ lib
│  │  └─ detector.js
│  │  └─ redactor.js
│  ├─ manifest.json
│  ├─ quantize.py
│  ├─ README.md
│  └─ styles
│     ├─ highlight.css
│     ├─ overlay.css
│     └─ popup.css
```
- `content.js` is responsible for event handling, which is currently limited to user input.
- `highlight.js` handles all highlighting logic of detected sensitive information.
![highlight_demo](../docs/media/highlight_demo.png)
- `overlay.js` handles the logic of the warning overlay when sensitive informatio is detected.
![overlay_demo](../docs/media/overlay_demo.png)
- `styles/` contains all the `css` code for styling.
- `manifest.js` is the configuration file instructing the browser how to load, run and display the extension.

## Chosen approaches

### Browser Extension
We chose to implement our endpoint DLP idea using a browser extension, as it is easy for a user to install and integrate our system into their usual workflow. It allows us to use reasonable computational resources to detect sensitive information without needing heavy applications running in the background. Also, `manifest.json` allows us to limit our extension's execution to specified LLM websites, which helps with privacy concerns.

### NER models
We chose Named Entity Recognition (NER) models to assist regex in a hybrid detection system, due to NER's ability to identify and classify data (entities) in unstructured text and categorize them into predifined categories such as people, organization etc.

### Regex
Regular Expression (regex) allow for super-fast classifications of text by comparing them to structured patterns that can help us classify text using substantially low computational resources. The downside of regex is lack of contextual awareness which can lead to false positives, along with it's inability of matching text if it's misstyped.

## Useful development resources

1. [HuggingFace](https://huggingface.co/)
2. [Optimum-ONNX](https://huggingface.co/docs/optimum-onnx/onnxruntime/overview)
3. [Bert-Base-NER](https://huggingface.co/dslim/bert-base-NER)
4. [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)