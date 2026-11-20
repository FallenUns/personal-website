---
title: Interactive CO₂ & GDP Explorer
summary: >-
  Built an interactive dashboard to compare countries on CO₂ emissions and GDP over time with world
  map, time-series, and bar charts.
category: Development
technologies:
  - R
  - Shiny
  - Leaflet
  - Plotly
  - tidyverse
  - sf (Spatial Data)
  - rnaturalearth
  - Data Visualization
order: 6
cover: gdpco2-1.png
coverAlt: >-
  Dashboard titled Comparing GDP and CO2 Emission with a world map, a CO2 line chart and a GDP bar
  chart
links:
  - label: Live site
    url: https://ryfaeg-patrick-adrianus.shinyapps.io/Assignment_3/
---

An interactive R Shiny dashboard developed for data visualization coursework to explore the relationship between economic development (GDP) and environmental impact (CO₂ emissions) across countries and time periods. The application combines spatial visualization with temporal analysis, allowing users to compare up to 20 countries simultaneously and observe how their emissions and economic indicators evolve from 1960 to 2020. The project demonstrates expertise in data wrangling, interactive visualization, and creating user-friendly interfaces for complex datasets.

## Features

- Interactive World Map with color-coded CO₂ emissions by country
- Year Slider (1960-2020) for temporal exploration
- Multi-country Selection (up to 20 countries) for comparative analysis
- Time-series Line Chart showing CO₂ emission trends over time
- GDP Bar Chart comparing economic indicators by year
- Synchronized Visualizations with year slider affecting all charts
- Hover Tooltips with detailed country-specific data
- Auto-zoom Map Feature focusing on selected countries
- Comprehensive References section citing 7+ academic sources
- Built-in User Guidance with "How to Interact" instructions
- Data Cleaning Pipeline handling missing values and data inconsistencies
- Responsive Layout with organized panels for easy navigation

## Challenges

- Data Integration: Merging CO₂ dataset (starting 1750) with GDP dataset (starting 1960) with different country codes
- Missing Data Management: Handling gaps in GDP values for certain countries/years
- Performance Optimization: Rendering large spatial datasets efficiently in Leaflet
- Color Scale Design: Creating meaningful color gradients for wide-ranging CO₂ values
- User Experience: Balancing feature richness with interface simplicity
- Country Code Standardization: Mapping between different country naming conventions (ISO codes)
- Data Filtering: Excluding aggregate regions (WLD, HIC, etc.) from country-level analysis

## Outcomes

- Successfully visualized 60+ years of global CO₂ and GDP data
- Enabled comparative analysis of economic vs environmental trends
- Demonstrated correlation between industrialization and emissions
- Created reusable Shiny framework for temporal-spatial data exploration
- Delivered transparent analysis with proper academic citations
- Achieved smooth performance with 2,000+ data points per visualization
- Provided self-serve analysis tool requiring no coding knowledge
- Met academic requirements for Data Visualisation coursework (Jun 2023)
