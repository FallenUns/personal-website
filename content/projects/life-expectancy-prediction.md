---
title: Life Expectancy Prediction
summary: >-
  Regression modelling to predict national life expectancy using multivariate public-health data
  with regularisation and feature selection.
category: Machine Learning
technologies:
  - Python
  - pandas
  - NumPy
  - scikit-learn
  - matplotlib
  - Polynomial Regression
  - Lasso Regularisation
  - Ridge Regularisation
order: 8
charts:
  - id: predicted-vs-actual-life-expectancy-regression-plot
    type: scatter
    title: Predicted vs Actual Life Expectancy (Regression Plot)
    data:
      - actual: 45
        predicted: 46.2
      - actual: 48
        predicted: 47.8
      - actual: 52
        predicted: 51.5
      - actual: 55
        predicted: 56.1
      - actual: 58
        predicted: 57.3
      - actual: 60
        predicted: 60.8
      - actual: 62
        predicted: 61.9
      - actual: 65
        predicted: 64.6
      - actual: 68
        predicted: 67.4
      - actual: 70
        predicted: 69.8
      - actual: 72
        predicted: 71.5
      - actual: 74
        predicted: 73.8
      - actual: 76
        predicted: 75.2
      - actual: 78
        predicted: 77.6
      - actual: 80
        predicted: 79.9
      - actual: 82
        predicted: 81.7
      - actual: 84
        predicted: 83.4
      - actual: 46
        predicted: 47.1
      - actual: 50
        predicted: 49.3
      - actual: 54
        predicted: 55.2
      - actual: 56
        predicted: 57.8
      - actual: 59
        predicted: 58.9
      - actual: 61
        predicted: 61.3
      - actual: 63
        predicted: 62.7
      - actual: 66
        predicted: 65.9
      - actual: 69
        predicted: 68.2
      - actual: 71
        predicted: 70.4
      - actual: 73
        predicted: 72.1
      - actual: 75
        predicted: 74.6
      - actual: 77
        predicted: 76.3
      - actual: 79
        predicted: 78.5
      - actual: 81
        predicted: 80.8
    xAxisKey: actual
    yAxisKeys:
      - predicted
    colors:
      - "#10b981"
  - id: model-performance-comparison-test-r
    type: bar
    title: Model Performance Comparison (Test R²)
    data:
      - model: Linear Regression
        r2: 0.75
      - model: Polynomial
        r2: 0.86
      - model: Poly + Ridge
        r2: 0.85
      - model: Poly + Lasso
        r2: 0.86
    xAxisKey: model
    yAxisKeys:
      - r2
    colors:
      - "#10b981"
  - id: test-mse-by-model
    type: bar
    title: Test MSE by Model
    data:
      - model: Linear Regression
        mse: 20.5
      - model: Polynomial
        mse: 11.1
      - model: Poly + Ridge
        mse: 11.5
      - model: Poly + Lasso
        mse: 11.3
    xAxisKey: model
    yAxisKeys:
      - mse
    colors:
      - "#ef4444"
---

This project built and evaluated regression models to predict national life expectancy using a multivariate public-health dataset. The work covered the full ML workflow: EDA, normalisation, baseline modelling, regularisation, feature selection, cross-validation, and prediction. Multiple linear and polynomial models were compared, with regularisation used to control overfitting. The final model—Polynomial Regression with Lasso regularisation—achieved strong generalisation performance and provided interpretable insights into the primary drivers of life expectancy across countries and years.

## Features

- Comprehensive EDA with skewness and outlier analysis
- Power transformation for variance stabilisation
- Min-Max scaling for feature normalisation
- One-hot encoding for categorical variables
- Linear and polynomial regression baselines
- Ridge and Lasso regularisation comparison
- K-Fold cross-validation for robust evaluation
- Learning curve analysis for generalisation assessment
- Residual analysis for model diagnostics
- Feature importance interpretation for health insights

## Challenges

- Heavy skewness and outliers in GDP, HIV/AIDS, population
- Mixed feature scales requiring normalisation
- Multicollinearity among mortality indicators
- Overfitting risk with polynomial features
- Balancing model complexity with interpretability
- Linear models may miss non-linear interactions
- Country-level temporal effects not explicitly modelled

## Outcomes

- Best model: Polynomial Regression + Lasso
- Test R² ≈ 0.86
- Test MSE ≈ 11.3
- CV average R² ≈ 0.87
- Key drivers identified: Adult mortality, schooling, income resources
- Full feature set outperformed reduced sets
- Strong generalisation confirmed via learning curves

## Charts

::chart{id="predicted-vs-actual-life-expectancy-regression-plot"}

::chart{id="model-performance-comparison-test-r"}

::chart{id="test-mse-by-model"}
