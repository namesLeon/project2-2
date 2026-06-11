# PII Preservation Evaluation

Measures how well LLM responses retain semantic meaning after PII is redacted or replaced.

## Datasets

| File | Description |
|---|---|
| `data/prompts.csv` | 400 synthetic prompts across 4 domains (Finance, Medicine, Law, Casual Q&A), each with embedded PII |
| `data/pii_map.json` | Maps each prompt ID to its original, redacted (`[EMAIL]`, `[SSN]`, etc.), and replacement (synthetic) PII values |
| `data/responses.json` | LLM responses for each prompt under three conditions: original, redacted, and replaced PII |

## Pipeline

1. **`generate_prompts.py`** — Generates `prompts.csv` and `pii_map.json` using Faker-synthesized PII across 10 types (email, phone, credit card, SSN, IBAN, BSN, VIN, DOB, MAC, name).
2. **`generate_responses.py`** — Feeds each prompt (original, redacted, replaced) to DeepSeek API and stores the responses in `responses.json`.
3. **`compute_metrics.py`** — Compares original vs redacted and original vs replaced responses using cosine similarity (SentenceTransformers) and BERTScore (precision, recall, F1).
4. **`graphs.py`** — Plots bar charts of the final aggregated cosine similarity and BERTScore metrics.
