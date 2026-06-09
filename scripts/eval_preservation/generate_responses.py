"""
generate_reponses.py - Generate 400 synthetic prompts across 4 domains with embedded PII.
Output: prompts.csv, pii_map.json
"""
'''
LLMs have been used for the generation of synthetic prompts and templates
Main Writer: Andreas Constantinou
Reviewer:
Contributors:
'''

import json
import os
import re
import time
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from openai import OpenAI
from tqdm import tqdm

load_dotenv()

"""
NOTE FOR ANYONE WORKING ON THIS REPOSITORY
DO NOT HARDCODE YOUR API KEY.
USE ENVIRONMENT VARIABLES
DO NOT HARDCORE YOUR API KEY.
"""
DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1"
MODEL = "deepseek-v4-flash"
TEMPERATURE = 0.0
SLEEP_SEC = 1.0

OUT_DIR = Path(__file__).resolve().parent / "data"
OUT_DIR.mkdir(exist_ok=True)

def load_data():
    df = pd.read_csv(OUT_DIR / "prompts.csv", dtype={"prompt_id": str})
    with open(OUT_DIR / "pii_map.json") as f:
        pii_map = json.load(f)
    return df, pii_map


def apply_replacements(text: str, pii_entry: dict, mode: str) -> str:
    """
    Replace PII values in `text` with their redacted or replacement forms.
    `mode`: "redacted" or "replacement"
    """
    result = text
    for pii_type, variants in pii_entry.items():
        original = variants["original"]
        substitute = variants[mode]
        pattern = re.escape(original)
        result = re.sub(pattern, substitute, result)
    return result


def query_deepseek(client: OpenAI, prompt: str) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=TEMPERATURE,
    )
    return response.choices[0].message.content

def main():
    api_key = os.environ.get("DEEPSEEK_API_KEY")
    if not api_key:
        raise RuntimeError(
            "DEEPSEEK_API_KEY not set. Either:\n"
            "  1. Create a .env file in the pipeline/ directory with: DEEPSEEK_API_KEY=sk-...\n"
            "  2. Or run: export DEEPSEEK_API_KEY='sk-...' && python generate_responses.py"
        )

    client = OpenAI(api_key=api_key, base_url=DEEPSEEK_BASE_URL)
    df, pii_map = load_data()

    responses = {}
    out_path = OUT_DIR / "responses.json"

    if out_path.exists():
        with open(out_path) as f:
            responses = json.load(f)
        print(f"Resuming from existing responses.json ({len(responses)} entries)")

    total = len(df)
    for _, row in tqdm(df.iterrows(), total=total, desc="Generating responses"):
        pid = row["prompt_id"]
        if pid in responses:
            continue

        original = row["original_prompt"]
        pii_entry = pii_map.get(pid, {})

        redacted_prompt = apply_replacements(original, pii_entry, "redacted")
        replaced_prompt = apply_replacements(original, pii_entry, "replacement")

        original_response = query_deepseek(client, original)
        time.sleep(SLEEP_SEC)
        redacted_response = query_deepseek(client, redacted_prompt)
        time.sleep(SLEEP_SEC)
        replaced_response = query_deepseek(client, replaced_prompt)
        time.sleep(SLEEP_SEC)

        responses[pid] = {
            "domain": row["domain"],
            "original_prompt": original,
            "redacted_prompt": redacted_prompt,
            "replaced_prompt": replaced_prompt,
            "original_response": original_response,
            "redacted_response": redacted_response,
            "replaced_response": replaced_response,
        }

        if len(responses) % 10 == 0:
            with open(out_path, "w") as f:
                json.dump(responses, f, indent=2)

    with open(out_path, "w") as f:
        json.dump(responses, f, indent=2)

    print(f"Responses saved -> {out_path} ({len(responses)} entries)")


if __name__ == "__main__":
    main()
