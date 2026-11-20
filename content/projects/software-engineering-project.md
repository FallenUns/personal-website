---
title: LLM Privacy Violation Detection
summary: >-
  End-to-end system to flag potential privacy violations in Stack Overflow posts using LLMs +
  heuristics
category: Research
technologies:
  - Python
  - FastAPI
  - scikit-learn
  - TensorFlow
  - Hugging Face
order: 3
featured: true
links:
  - label: Source on GitHub
    url: https://github.com/FallenUns/Detecting-Privacy-Violation-using-LLM
charts:
  - id: correct-vs-incorrect-labels-of-privacy-violations
    type: bar
    title: Correct vs Incorrect Labels of Privacy Violations
    data:
      - name: DeepSeek CoT
        correct: 65
        incorrect: 81
      - name: DeepSeek Few Shot
        correct: 68
        incorrect: 78
      - name: DeepSeek Zero Shot
        correct: 54
        incorrect: 92
      - name: GPT CoT
        correct: 67
        incorrect: 79
      - name: GPT Few Shot
        correct: 65
        incorrect: 81
      - name: GPT Zero Shot
        correct: 41
        incorrect: 105
    xAxisKey: name
    yAxisKeys:
      - correct
      - incorrect
    colors:
      - "#22c55e"
      - "#ef4444"
  - id: model-performance-metrics-comparison
    type: bar
    title: Model Performance Metrics Comparison
    data:
      - name: GPT Zero Shot
        precision: 24.4
        recall: 28.1
        f1Score: 26.1
        accuracy: 88.4
      - name: GPT Few Shot
        precision: 24.9
        recall: 44.5
        f1Score: 31.9
        accuracy: 86.2
      - name: GPT CoT
        precision: 22.2
        recall: 45.9
        f1Score: 29.9
        accuracy: 84.3
      - name: DS Zero Shot
        precision: 25.1
        recall: 37
        f1Score: 29.9
        accuracy: 87.4
      - name: DS Few Shot
        precision: 25.4
        recall: 46.6
        f1Score: 32.7
        accuracy: 86.1
      - name: DS CoT
        precision: 24.9
        recall: 44.5
        f1Score: 31.9
        accuracy: 86.2
    xAxisKey: name
    yAxisKeys:
      - precision
      - recall
      - f1Score
      - accuracy
    colors:
      - "#3b82f6"
      - "#ef4444"
      - "#10b981"
      - "#f59e0b"
---

Research + production-minded pipeline that collects Stack Overflow posts (2020–2024), filters candidates with rule-based heuristics, and evaluates LLMs (GPT-4o, DeepSeek) across zero-shot, few-shot, and chain-of-thought prompts. Includes manual annotation, metrics, and a small API/dashboard for triage.

## Features

- 1.5M+ post extraction into SQLite + CSV
- Heuristic filter (≈90+ privacy keywords) to build candidate set
- Manual annotation set (2,000 rows) for ground truth
- LLM eval: GPT-4o & DeepSeek with zero/few/CoT prompts
- Metrics pipeline (precision/recall/F1/accuracy) + confusion matrices
- Dashboard + API for reviewer triage

## Challenges

- High class imbalance (~7.3% positive) impacts accuracy interpretation
- False positives from generic “privacy/security” language
- Distinguishing placeholders vs real secrets (e.g., keys, IPs, repos)
- NLI-based filtering produced excessive false positives → pivoted to rules
- Runtime/cost trade-offs across prompt types and providers

## Outcomes

- Best F1: 32.7% (DeepSeek, few-shot); recall 46.6%
- GPT-4o CoT recall up to 45.9% with lower precision
- High overall accuracy (≥84%) but not meaningful due to imbalance
- Result: viable as human-in-the-loop prefilter; not ready for full automation

## Charts

::chart{id="correct-vs-incorrect-labels-of-privacy-violations"}

::chart{id="model-performance-metrics-comparison"}
