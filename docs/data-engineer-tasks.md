# Data Engineer / Data Analyst Tasks — Imaging Critique Fuzzy Project

This document lists concrete tasks, scripts, queries, and validation steps for data engineers and analysts to prepare the dataset required for the fuzzy-logic module (Section 6 imaging critique).

## 1. Goals
- Extract structured, anonymized training data linking `studentScores` and `assessorScores` with evaluation metadata.
- Produce clean CSV/JSONL/Parquet datasets for FCM/GA training and evaluation.
- Provide reproducible ETL and data validation pipelines.

## 2. Required Dataset Schema (one record per evaluation)
- evaluation_id: string
- timestamp: ISO datetime
- assessor_db_id: string
- student_db_id: string (nullable)
- image_id: string (nullable)
- projection_type: string (e.g., AP, PA, Lateral)
- device_model: string (optional)
- case_difficulty: enum (low/medium/high) optional

- student_scores: JSON object with numeric fields (consistent scale)
- assessor_scores: JSON object with same keys as student_scores
- diffs: JSON object (assessor - student) — can be computed in ETL

- assessor_overall_numeric: number (0..100) or mapped 1..4
- assessor_overall_category: string (Poor/Fair/Good/Excellent)
- assessor_retake: enum (Yes/Maybe/No)
- comments: string (optional)
- fuzzy_results: JSON (optional; stored after FIS run)

## 3. Extraction (SQL example)
- Simple extract from Postgres/Prisma JSON column (example):

```sql
SELECT
  id AS evaluation_id,
  created_at AS timestamp,
  assessor_id AS assessor_db_id,
  student_id AS student_db_id,
  metadata->>'imageId' AS image_id,
  metadata->>'projectionType' AS projection_type,
  data->'studentScores' AS student_scores,
  data->'assessorScores' AS assessor_scores,
  (data->>'assessorOverallNumeric')::float AS assessor_overall_numeric,
  data->>'assessorOverallCategory' AS assessor_overall_category,
  data->>'assessorRetake' AS assessor_retake,
  comments
FROM evaluations
WHERE data IS NOT NULL
AND created_at BETWEEN '2024-01-01' AND '2026-05-01'
;
```

- Export to CSV or JSONL using `COPY` or `psql`:

```bash
psql -d mydb -c "\copy (SELECT ...) TO STDOUT WITH CSV HEADER" > evaluations_export.csv
```

## 4. ETL Script (Python outline)
- Responsibilities:
  - Load raw rows
  - Normalize scoring scales (if necessary)
  - Compute `diffs` and `abs_diffs`
  - Fill missing values or mark rows for review
  - Add derived features (perCriterionAbsDiffCount, weightedDiffs, case_difficulty encoding)
  - Split into train/val/test by time or random seed

- Minimal example using `pandas`:

```python
import pandas as pd

df = pd.read_json('evaluations_export.jsonl', lines=True)
# expand JSON columns
student = pd.json_normalize(df['student_scores'])
assessor = pd.json_normalize(df['assessor_scores'])
# compute diffs
diffs = assessor - student
# attach diffs and export
df['diffs'] = diffs.to_dict(orient='records')
df.to_parquet('data/evaluations_with_diffs.parquet')
```

## 5. Data Validation Checks
- Consistent scoring domains for student and assessor (same min/max)
- No unexpected nulls in key fields (assessor scores, evaluation_id)
- Distribution checks: per-field histograms, missing-value percentages
- Spot-check records against UI (random sample of N=20) to ensure mapping correctness

Automated tests (pytest):
- test_no_null_assessor_scores
- test_diff_computation
- test_train_val_split_size

## 6. Label Quality & Consensus
- If multiple assessors exist, compute consensus label (majority or mean). Store `consensus_overall_category` and `consensus_overall_numeric`.
- Add `label_confidence` metric (e.g., stddev across assessors).

## 7. Sampling Strategy
- Stratify by `projection_type` and `case_difficulty` to ensure balanced training.
- If scarce classes (e.g., `Poor`), consider SMOTE or careful oversampling for training only.

## 8. Storage & Formats
- Working/processed dataset: Parquet (columnar, compressed)
- Exchange format for ML: JSONL (readable) or Parquet (fast)
- Small samples: CSV with headers for quick inspection

## 9. Privacy & Anonymization
- Remove PHI (patient names, MRNs). Replace with hashed IDs if needed.
- Keep image references (image_id) but no direct patient identifiers.
- Maintain an access-controlled mapping if re-identification is necessary for audits.

## 10. Feature Engineering Suggestions
- perCriterionAbsDiffCount = count(|diff| > THRESHOLD)
- weighted_sum_diff = sum(weights[i] * |diff_i|)
- critical_flag = any(|diff_critical_fields| > threshold)
- difficulty_encoded as one-hot

## 11. GA / Model Training Data Preparation
- Save splits: `data/train.parquet`, `data/val.parquet`, `data/test.parquet`
- Provide a small `train_manifest.json` describing number of samples per class
- Provide sample generator script to create synthetic diffs for unit tests and initial GA runs

## 12. Example Exporter Script (CLI)
- `scripts/export_evaluations.py --start 2024-01-01 --end 2026-05-01 --out data/evals.parquet`
- Should produce both raw and processed datasets and a `manifest.json` containing counts and field stats.

## 13. Quick QA Checklist for Analysts
- [ ] Confirm scale parity (student vs assessor)
- [ ] Inspect top-10 frequent `projection_type`
- [ ] Check class balance for `assessor_overall_category`
- [ ] Visualize diffs heatmap (criteria vs samples)
- [ ] Provide samples for domain expert review (N=30)

## 14. Useful Queries & Commands
- Row counts by category:
```sql
SELECT data->>'assessorOverallCategory' AS cat, COUNT(*)
FROM evaluations
GROUP BY cat;
```

- Export JSONL in psql:
```bash
psql -d mydb -c "\copy (SELECT row_to_json(t) FROM (SELECT id, data FROM evaluations) t) TO 'evaluations.jsonl'"
```

## 15. Handoff Notes for Data Scientists
- Provide column definitions and a README for fields used in FIS/GA training.
- Include `manifest.json` with descriptive stats and null counts.
- Provide a sample of 50 human-reviewed records with assessor notes for tuning rules.

---

If you want, I can now:
- Add a runnable `scripts/export_evaluations.py` that extracts and prepares the dataset from your Prisma/Postgres DB, or
- Create a small synthetic-data generator for GA prototyping.

Which one should I generate next?