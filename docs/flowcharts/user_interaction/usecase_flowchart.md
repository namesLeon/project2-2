---
config:
  layout: fixed
---
flowchart LR
    A["Download model and tokenize"] --> B["Convert to ONNX Runtime"]
    B --> C["Quantize the model"]
    C --> D["Save model"] & E["Inference"]
    E --> F["Tokenizer and Bert model"]
    G@{ label: "Input prompt, e.g: 'My name is Alex'" } --> F
    F --> H["PII detection output"]

    G@{ shape: rect}