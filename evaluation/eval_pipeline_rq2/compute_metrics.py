'''
Main Writer:Jianu Mihnea-Alexandru
Reviewer: 
Contributors:
'''
from pathlib import Path
import json
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from bert_score import score

JSON_PATH = Path("evaluation\\eval_pipeline_rq2\\data\\responses.json")

model = SentenceTransformer("all-MiniLM-L6-v2")


def make_stats():
    return {
        "count": 0,
        "cos_sum": 0.0,
        "p_sum": 0.0,
        "r_sum": 0.0,
        "f1_sum": 0.0,
        "cos_min": float("inf"),
        "cos_max": float("-inf"),
        "p_min": float("inf"),
        "p_max": float("-inf"),
        "r_min": float("inf"),
        "r_max": float("-inf"),
        "f1_min": float("inf"),
        "f1_max": float("-inf"),
    }


def update_stats(stats, cos_sim, p, r, f1):
    stats["count"] += 1
    stats["cos_sum"] += cos_sim
    stats["p_sum"] += p
    stats["r_sum"] += r
    stats["f1_sum"] += f1

    stats["cos_min"] = min(stats["cos_min"], cos_sim)
    stats["cos_max"] = max(stats["cos_max"], cos_sim)

    stats["p_min"] = min(stats["p_min"], p)
    stats["p_max"] = max(stats["p_max"], p)

    stats["r_min"] = min(stats["r_min"], r)
    stats["r_max"] = max(stats["r_max"], r)

    stats["f1_min"] = min(stats["f1_min"], f1)
    stats["f1_max"] = max(stats["f1_max"], f1)


def evaluate_pair(text1, text2):
    """
    Compare text1 vs text2 using cosine similarity and BERTScore.
    text1 is treated as the candidate and text2 as the reference.
    """
    embeddings = model.encode([text1, text2])

    cos_sim = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]

    P, R, F1 = score(
        [text1],
        [text2],
        lang="en",
        rescale_with_baseline=True
    )

    return cos_sim, P.item(), R.item(), F1.item()


def print_summary(title, stats):
    n = stats["count"]
    if n == 0:
        print(f"\n{title}")
        print("No valid records found.")
        return

    print(f"\n{title}")
    print("-" * len(title))
    print("COSINE MIN:", stats["cos_min"])
    print("COSINE MAX:", stats["cos_max"])
    print("PRECISION MIN:", stats["p_min"])
    print("PRECISION MAX:", stats["p_max"])
    print("RECALL MIN:", stats["r_min"])
    print("RECALL MAX:", stats["r_max"])
    print("F1 MIN:", stats["f1_min"])
    print("F1 MAX:", stats["f1_max"])
    print()
    print("COSINE AVERAGE:", stats["cos_sum"] / n)
    print("PRECISION AVERAGE:", stats["p_sum"] / n)
    print("RECALL AVERAGE:", stats["r_sum"] / n)
    print("F1 AVERAGE:", stats["f1_sum"] / n)


with open(JSON_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

if not isinstance(data, dict):
    raise ValueError("JSON file must contain a dictionary of records.")

stats_original_redacted = make_stats()
stats_original_replaced = make_stats()

for record_id, record in sorted(data.items()):
    original_response = record.get("original_response", "").strip()
    redacted_response = record.get("redacted_response", "").strip()
    replaced_response = record.get("replaced_response", "").strip()

    if not original_response or not redacted_response or not replaced_response:
        print(f"Skipping {record_id}: missing one or more response fields.")
        continue

    # original vs redacted
    cos_sim, p, r, f1 = evaluate_pair(original_response, redacted_response)
    update_stats(stats_original_redacted, cos_sim, p, r, f1)

    print(f"\nRecord {record_id} | original vs redacted")
    print("Cosine similarity:", cos_sim)
    print("Precision:", p)
    print("Recall:", r)
    print("F1:", f1)

    # original vs replaced
    cos_sim, p, r, f1 = evaluate_pair(original_response, replaced_response)
    update_stats(stats_original_replaced, cos_sim, p, r, f1)

    print(f"\nRecord {record_id} | original vs replaced")
    print("Cosine similarity:", cos_sim)
    print("Precision:", p)
    print("Recall:", r)
    print("F1:", f1)

print("\n\nFINAL RESULTS")
print("=" * 40)

print_summary("Original vs Redacted", stats_original_redacted)
print_summary("Original vs Replaced", stats_original_replaced)