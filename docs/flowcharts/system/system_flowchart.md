```mermaid
flowchart TD
    A[Download & Quantize Model] --> B[Save Model & Tokenizer]
    B --> C[detectPII in Frontend]
    D[User Input / Paste] --> C
    C --> E[Highlight + Render Findings]