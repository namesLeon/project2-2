'''
Main Writer:Jianu Mihnea-Alexandru
Reviewer: 
Contributors:
'''


from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from bert_score import score

model = SentenceTransformer("all-MiniLM-L6-v2")

cos_sim_avg = 0
P_avg = 0
R_avg = 0
F1_avg = 0

cos_sim_min = 1
cos_sim_max = 0
P_min = 1
P_max = 0
R_min = 1
R_max = 0
F1_min = 1
F1_max = 0

with open("answers_prompts.txt", "r", encoding="utf-8") as f:
    answers = [line.strip() for line in f if line.strip()]

if len(answers) % 2 != 0:
    raise ValueError(
        f"File contains {len(answers)} non-empty lines. "
        "Expected an even number of lines."
    )

for i in range(0, len(answers), 2):
    answer_a = answers[i]
    answer_b = answers[i + 1]

    embeddings = model.encode([answer_a, answer_b])

    cos_sim = cosine_similarity(
        [embeddings[0]],
        [embeddings[1]]
    )[0][0]

    P, R, F1 = score(
        [answer_b],
        [answer_a],
        lang="en",
        rescale_with_baseline=True
    )
    if(cos_sim < cos_sim_min):
        cos_sim_min = cos_sim
    if(cos_sim > cos_sim_max):
        cos_sim_max = cos_sim
    if(P.item() < P_min):
        P_min = P.item()
    if(P.item() > P_max):
        P_max = P.item()
    if(R.item() < R_min):
        R_min = R.item()
    if(R.item() > R_max):
        R_max = R.item()
    if(F1.item() < F1_min):
        F1_min = F1.item()
    if(F1.item() > F1_max):
        F1_max = F1.item()
    
    print(f"\nPair {(i // 2) + 1}")
    print(f"Line {i + 1} vs Line {i + 2}")
    print("Cosine similarity:", cos_sim)
    print("Precision:", P.item())
    print("Recall:", R.item())
    print("F1:", F1.item())
    cos_sim_avg += cos_sim
    P_avg += P.item()
    R_avg += R.item()
    F1_avg += F1.item()
print(" ")
print(" ")
print("COSINE MIN:", cos_sim_min)
print("COSINE MAX:", cos_sim_max)
print("PRECISION MIN:", P_min)
print("PRECISION MAX:", P_max)
print("RECALL MIN:", R_min)
print("RECALL MAX:", R_max)
print("F1 MIN:", F1_min)
print("F1 MAX:", F1_max)
print(" ")
print(" ")
print("COSINE AVERAGE:", cos_sim_avg / (len(answers) // 2))
print("PRECISION AVERAGE:", P_avg / (len(answers) // 2))
print("RECALL AVERAGE:", R_avg / (len(answers) // 2))
print("F1 AVERAGE:", F1_avg / (len(answers) // 2))

#min si max 