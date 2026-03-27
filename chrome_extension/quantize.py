"""
quantize.py

Description:
    This module is responsible for downloading a specified model from HuggingFace,
    converting it to ONNX Runtime (ORT) format, and saving both model and respective tokenizer to `chrome_extension/models`

Clarifications for Developers:
    Tokenizer converts raw text to numeric tokens and attention masks that the model can process
    AutoTokenizer automatically ensures that the tokenizer matches the model
    ORTModelForTokenClassification loads and converts the specified model to ONNX Runtime (ORT) format

Usage: 
    Run this file by executing the following command while in repo's:
    python chrome_extension/quantize.py
"""

from pathlib import Path
from transformers import AutoTokenizer
from optimum.onnxruntime import ORTModelForTokenClassification, ORTQuantizer
from optimum.onnxruntime import AutoQuantizationConfig

MODEL_NAME = "dslim/bert-base-NER"
OUTPUT_DIR = Path("chrome_extension/models")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

print("Downloading model...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

print("Converting to ONNX...")
ort_model = ORTModelForTokenClassification.from_pretrained(MODEL_NAME)

print("Quantizing model...")
quantizer = ORTQuantizer.from_pretrained(ort_model)
dqconfig = AutoQuantizationConfig.avx2(is_static=False)

print("Saving to output...")
#ort_model.save_pretrained(OUTPUT_DIR) uncomment if you want to run benchmarks with unquantized model
tokenizer.save_pretrained(OUTPUT_DIR)
quantizer.quantize(
    save_dir=OUTPUT_DIR,
    quantization_config=dqconfig
)

print(f"Model successfully downloaded, converted to ORT, and saved to {OUTPUT_DIR}/, along with respective tokenizer")