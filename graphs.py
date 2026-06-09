import matplotlib.pyplot as plt
import numpy as np

# -----------------------------
# DATA
# -----------------------------
metrics_bert = ["Precision", "Recall", "F1"]

redacted_bert = np.array([
    0.1747952875,
    0.1580435918,
    0.1660140044
]) * 100

replaced_bert = np.array([
    0.2419594768,
    0.2348029865,
    0.2379050148
]) * 100

cosine_labels = ["Redacted", "Replaced"]

cosine_values = np.array([
    0.74229276,
    0.74559057
]) * 100

# consistent colors
color_redacted = "#1f77b4"  # blue
color_replaced = "#ff7f0e"  # orange

# -----------------------------
# 1. COSINE SIMILARITY (VERTICAL)
# -----------------------------
plt.figure(figsize=(6, 4))

plt.bar(
    cosine_labels,
    cosine_values,
    color=[color_redacted, color_replaced]
)

plt.ylabel("Average (%)")
plt.title("Performance Preservation - Cosine Similarity")

plt.ylim(0, 100)

plt.tight_layout()
plt.show()

# -----------------------------
# 2. BERTSCORE (PRECISION / RECALL / F1)
# -----------------------------
x = np.arange(len(metrics_bert))
width = 0.35

plt.figure(figsize=(8, 4))

plt.bar(x - width/2, redacted_bert, width,
        label="Redacted", color=color_redacted)

plt.bar(x + width/2, replaced_bert, width,
        label="Replaced", color=color_replaced)

plt.xticks(x, metrics_bert)
plt.ylabel("Average (%)")
plt.title("Performance Preservation - BertScore")

plt.ylim(0, 100)
plt.legend()

plt.tight_layout()
plt.show()