---
title: Job Ads Data Parsing & Integration
summary: >-
  End-to-end data cleaning and integration pipeline for heterogeneous job advertisement datasets
  with schema alignment and salary normalisation.
category: Data Science
technologies:
  - Python
  - pandas
  - NumPy
  - Regex
  - Data Cleaning
  - ETL Pipeline
  - Data Integration
order: 7
charts:
  - id: data-cleaning-pipeline-results
    type: bar
    title: Data Cleaning Pipeline Results
    data:
      - stage: Raw Datasets
        count: 2
      - stage: Schema Aligned
        count: 2
      - stage: Duplicates Removed
        count: 1
      - stage: Final Unified
        count: 1
    xAxisKey: stage
    yAxisKeys:
      - count
    colors:
      - "#3b82f6"
---

This project focused on parsing, cleaning, and integrating two heterogeneous job advertisement datasets into a single, consistent table suitable for analysis and modelling. The work addressed real-world data quality issues including inconsistent schemas, mixed salary units, missing values, duplicates, and noisy text fields. The final output was a clean, unified job-ads dataset with standardised attributes and validation checks, enabling reliable downstream analytics such as categorisation and labour-market insights.

## Features

- Schema alignment mapping source-specific columns to unified structure
- Salary parsing with regex extraction and unit conversion (hourly/weekly/annual)
- Annualised salary normalisation for cross-dataset comparability
- Outlier capping for extreme salary values
- Date parsing into standard datetime format
- Location string normalisation reducing state/city variants
- Contract type standardisation (full-time, part-time, contract)
- Multi-field deduplication using title, company, location, and posting date
- Missing value recovery with logical defaults
- Reproducible Jupyter notebooks for full pipeline

## Challenges

- Multiple sources using different schemas and naming conventions
- Salary fields appearing in inconsistent units (hourly, weekly, annual)
- Dates, locations, and contract types inconsistently formatted
- Duplicates and partial records common across datasets
- Salary parsing relied on heuristic rules rather than employer-verified values
- Location normalisation complexity without geocoding
- Balancing data recovery vs dropping unreliable records

## Outcomes

- Successfully integrated 2 raw datasets into unified schema
- All salary units standardised to annualised metric
- Duplicate records identified and removed
- Extreme salary values capped for analysis reliability
- Final dataset clean and analysis-ready
- Reproducible pipeline suitable for future data ingestion

## Charts

::chart{id="data-cleaning-pipeline-results"}
