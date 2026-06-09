import json
import random
import multiprocessing
import os
import numpy as np
from gliner.evaluation import BaseNEREvaluator
from torch.utils.data import DataLoader

#Main Writer: Anatolie
#Reviewer:
#Contributors: Leonard

# Set environment variables early so torch/MPS picks them up before imports
os.environ["PYTORCH_MPS_HIGH_WATERMARK_RATIO"] = "0.0"

from gliner import GLiNER
from datasets import load_dataset
import torch

SEED = 42

#if you want to train from scratch, uncomment line 122;

def set_reproducible_seed(seed: int = SEED):
  """Set seeds and deterministic flags for reproducible runs."""
  random.seed(seed)
  np.random.seed(seed)
  torch.manual_seed(seed)
  if torch.cuda.is_available():
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

  # Some PyTorch ops may not have deterministic implementations.
  # warn_only=True keeps training running while still preferring deterministic paths.
  torch.use_deterministic_algorithms(True, warn_only=True)

def convert_to_gliner(dataset):
  """Converts the dataset into a list of objects suitable to train the GLiNER model.

  Notes:
  - Accepts a `datasets.Dataset` and returns a list of records.
  - Handles cases where `gliner_entities` is already parsed (list/dict) or is a JSON string.
  """
  df = dataset.to_pandas()
  required = ["gliner_tokenized_text", "gliner_entities"]
  if not all(col in df.columns for col in required):
    raise ValueError(f"Dataset missing required columns: {required}")

  df = df[["gliner_tokenized_text", "gliner_entities"]]
  df = df.rename(columns={"gliner_tokenized_text": "tokenized_text", "gliner_entities": "ner"})

  def _parse_ner(x):
    if isinstance(x, str):
      try:
        return json.loads(x)
      except json.JSONDecodeError:
        raise ValueError("Failed to parse `gliner_entities` JSON string")
    return x

  df["ner"] = df["ner"].apply(_parse_ner)
  return df.to_dict(orient="records")

def safe_evaluate(model, test_data, flat_ner: bool = False, multi_label: bool = False, threshold: float = 0.5, batch_size: int = 12):
  """Robust evaluation wrapper that converts decoder Span objects to tuples.

  work-around for GLiNER versions that return Span dataclasses from the
  decoder while the evaluator expects sequence tuples (start, end, label).
  """
  collator = model.data_collator_class(
    model.config,
    data_processor=model.data_processor,
    return_tokens=True,
    return_entities=True,
    return_id_to_classes=True,
    prepare_labels=False,
  )
  data_loader = DataLoader(test_data, batch_size=batch_size, shuffle=False, collate_fn=collator)

  # Get raw predictions (lists of Span objects or similar)
  all_preds = model._process_batches(data_loader, threshold, flat_ner, multi_label)

  # Convert predictions into (start, end, label) tuples per-sample
  preds_tuples = []
  for sample in all_preds:
    sample_tups = []
    for ent in sample:
      if hasattr(ent, "start") and hasattr(ent, "end") and hasattr(ent, "entity_type"):
        sample_tups.append((ent.start, ent.end, ent.entity_type))
      elif isinstance(ent, dict):
        sample_tups.append((ent.get("start"), ent.get("end"), ent.get("label")))
      else:
        # Fallback: try to coerce to tuple
        sample_tups.append(tuple(ent))
    preds_tuples.append(sample_tups)

  # Collect ground truth entities from the collated dataloader
  all_trues = []
  for batch in data_loader:
    all_trues.extend(batch["entities"])

  evaluator = BaseNEREvaluator(all_trues, preds_tuples)
  out, f1 = evaluator.evaluate()
  return out, f1


if __name__ == "__main__":
  multiprocessing.freeze_support()
  set_reproducible_seed(SEED)

  # load the dataset (do this inside main to avoid side-effects on import)
  dataset = load_dataset("E3-JSI/synthetic-multi-pii-ner-v1", split="train")

  # convert the dataset to GLiNER compatible format
  data = convert_to_gliner(dataset)

  # Base NER model
  model = GLiNER.from_pretrained("urchade/gliner_small-v2.1")

  # 80/20 split
  random.Random(SEED).shuffle(data)
  train_dataset = data[:int(len(data) * 0.8)]
  test_dataset = data[int(len(data) * 0.8):]

  # Training the fine-tuned model
  # new_model = model.train_model(train_dataset=train_dataset, eval_dataset=test_dataset, output_dir="gliner_new_model")

  # Loading best checkpoint from training and evaluating both original and fine-tuned models
  new_model = GLiNER.from_pretrained("gliner_new_model/checkpoint-3000")
  results_out, results_f1 = safe_evaluate(model, test_dataset)

  print("\n===== BASE MODEL COMPARISON =====")
  print(results_out)
  print(f"Original Model F1     : {results_f1:.4f}")

  finetuned_results_out, finetuned_results_f1 = safe_evaluate(new_model, test_dataset)

  print("\n===== FINETUNED MODEL COMPARISON =====")
  print(finetuned_results_out)
  print(f"Finetuned Model F1    : {finetuned_results_f1:.4f}")

