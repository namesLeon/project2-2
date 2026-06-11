```mermaid
flowchart TD
    A[User] -->|Input| B(LLM)
    B --> C{Prompt verification AI}
    C -->|PII Detected| D[Highlighted prompt]
    C -->|PII Not detected| E[Prompt]
    D -->|Click on Highlight| F[Suggestion for change]
