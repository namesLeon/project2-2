# Group 14 - Cybersecurity

## Description

An endpoint data-loss-prevention (DLP) tool that automatically detects sensitive information such as PII or confidential data (API keys, financial data, auth tokens, etc.) in AI prompts to prevent their accidental exposure to the cloud. Our detector uses regex and a locally hosted GLiNER NER model so that no data ever leaves your machine.

## Repository Structure

```
group-14-cybersecurity
├── chrome_extension/          # Chrome extension
│   ├── src/
│   │   ├── content/           # content.js, highlight.js, overlay.js
│   │   ├── lib/               # detector.js (regex + NER client)
│   │   └── styles/            # highlight.css, overlay.css
│   ├── manifest.json          # Extension configuration
│   ├── quantize.py            # ONNX quantization script
│   └── README.md
├── scripts/
│   ├── eval_preservation/     # PII preservation evaluation scripts
│   └── fine_tuning/           # GLiNER fine-tuning script
├── docs/
│   ├── flowcharts/            # System and user interaction flowcharts
│   ├── media/                 # Screenshots and demo assets
│   └── ui/                    # UI mockups
├── NER_server.py              # GLiNER NER model server (Ray Serve)
├── requirements.txt           # Python dependencies
└── LICENSE                    # GPL Open Source License
```

## GLiNER Server Setup

1. Create and activate a virtual environment:

### GLiNER Server setup
Ensure virtual environment is activated and required libraries are installed.
```
curl -X POST http://127.0.0.1:8000 \
    -H "Content-Type: application/json" \
    -d '{"text": "Cristiano Ronaldo was born in 1985 and plays for Al Nassr", "labels": ["Person", "Date", "Teams"]}'
```
### Accesing fine tuned model
Due to the that the model size is too big , the following google drive link gives access to the checkpoint of the model:
link: https://drive.google.com/drive/folders/1Qg3sUyRwqMGFAQYz1vP6WFpAkGiimmcu?usp=sharing

   - **Linux/macOS**: `python -m venv .venv && source .venv/bin/activate`
   - **Windows**: `python -m venv .venv` then `.venv\Scripts\Activate.ps1`

2. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

3. Start the server:

   ```
   python NER_server.py
   ```

   The GLiNER model will load and the server will listen on `http://0.0.0.0:8000`.

4. Verify the server is working:

   ```
   curl -X POST http://127.0.0.1:8000 \
       -H "Content-Type: application/json" \
       -d '{"text": "Cristiano Ronaldo was born in 1985 and plays for Al Nassr", "labels": ["Person", "Date", "Teams"]}'
   ```

## Extension Setup & Installation

1. Launch Google Chrome
2. Visit `chrome://extensions/`
3. Turn on **Developer mode** and select **Load unpacked** on the top left
4. Navigate to the repo and select the `chrome_extension` folder
5. The extension is now loaded and running

## Demo

1. Navigate to an LLM website supported by the extension:
   - [ChatGPT](https://chatgpt.com/)
   - [Claude](https://claude.ai/)
   - [Gemini](https://gemini.google.com)
   - [Perplexity](https://www.perplexity.ai/)

2. Press `F12` to open Developer Tools.

3. Type PII into any text input and inspect the **Console** tab.

![console](docs/media/console_snippet.png)

4. Detected sensitive data is highlighted in red.

![highlight_demo](docs/media/highlight_demo.png)

5. A warning overlay appears at the top right of the page.

![overlay_demo](docs/media/overlay_demo.png)
