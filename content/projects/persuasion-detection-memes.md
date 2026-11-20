---
title: Persuasion Detection in Memes
summary: >-
  Multimodal deep learning system for detecting propaganda techniques in memes using BERT + Xception
  fusion with multi-task learning.
category: Machine Learning
technologies:
  - Python
  - TensorFlow
  - Keras
  - BERT
  - Xception
  - BiLSTM
  - Hugging Face Transformers
  - keras-tuner
  - Multi-task Learning
  - Deep Learning
order: 9
charts:
  - id: neural-network-architecture-layers
    type: bar
    title: Neural Network Architecture Layers
    data:
      - layer: |-
          Input
          (Text+Image)
        nodes: 2
        fill: "#3b82f6"
      - layer: Hidden
        nodes: 3
        fill: "#8b5cf6"
      - layer: Output
        nodes: 1
        fill: "#10b981"
    xAxisKey: layer
    yAxisKeys:
      - nodes
    colors:
      - "#8b5cf6"
  - id: dataset-distribution
    type: bar
    title: Dataset Distribution
    data:
      - split: Train
        samples: 687
      - split: Validation
        samples: 63
      - split: Test
        samples: 200
    xAxisKey: split
    yAxisKeys:
      - samples
    colors:
      - "#8b5cf6"
  - id: top-propaganda-techniques-training-set
    type: bar
    title: Top Propaganda Techniques (Training Set)
    data:
      - technique: Smears
        count: 450
      - technique: Loaded Language
        count: 360
      - technique: Name Calling
        count: 252
      - technique: Appeal to Fear
        count: 180
      - technique: Exaggeration
        count: 150
    xAxisKey: technique
    yAxisKeys:
      - count
    colors:
      - "#f59e0b"
---

This project built a multimodal meme understanding system that detects persuasion/propaganda techniques using both multi-label classification (which of 22 techniques appear in a meme) and token-level span tagging (which parts of the text correspond to each technique). The pipeline fused BERT (text) and Xception (image) features, trained with class imbalance handling, and optimised using a custom validation objective that balances performance across both tasks.

## Features

- Multimodal fusion of BERT text embeddings + Xception image features
- Multi-label classification for 22 propaganda techniques
- Token-level span tagging with BiLSTM sequence modelling
- Character-to-token span alignment using BertTokenizerFast
- Class imbalance handling via oversampling and weighted loss
- Custom multi-task loss weighting (0.6 main + 0.4 enhancement)
- Custom validation metric: balanced F1 across both tasks
- Image augmentation (flips, brightness, contrast, rotation, cropping)
- Hyperparameter tuning with keras_tuner RandomSearch
- Fine-tuning with unfrozen BERT/Xception layers
- Per-class confusion matrices and classification reports

## Challenges

- Meaning split across text and visuals in memes
- Heavy class imbalance with rare propaganda techniques
- Dense and noisy span tagging with token alignment issues
- Small dataset size (687 train samples) increasing overfitting risk
- Token-level multi-label tagging sensitivity to thresholding
- Balancing multi-task learning without one task dominating
- Aligning character-level span labels to tokenised text

## Outcomes

- Successfully trained multimodal model (text + image)
- Multi-task predictions for technique labels and token spans
- Effective class imbalance mitigation via oversampling + weighting
- Custom training callbacks for early stopping and LR scheduling
- Reproducible preprocessing and structured evaluation pipeline
- Demonstrated multimodal deep learning and NLP fusion skills

## Charts

::chart{id="neural-network-architecture-layers"}

::chart{id="dataset-distribution"}

::chart{id="top-propaganda-techniques-training-set"}
