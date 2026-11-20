---
title: Reffy
summary: >-
  A mobile app for running casual sports nights with auto-balanced teams, live scoring, fair sit-out
  rotation, and persistent ELO leaderboards.
category: Mobile
technologies:
  - Expo
  - React Native
  - React
  - TypeScript
  - Expo Router
  - SQLite
  - Zustand
  - Supabase
  - Astro
order: 1
featured: true
cover: /reffy-logo-light.svg
coverDark: /reffy-logo-dark.svg
coverAlt: Reffy bullseye logo
links:
  - label: playreffy.com
    url: https://playreffy.com
---

Reffy is a mobile companion for casual sports sessions where the hardest part is usually not the game, but organizing fair teams, rotating sit-outs, tracking scores, and keeping everyone bought into the leaderboard. The app lets a host add players, choose a sport and format, auto-pair balanced teams every round using player ratings, enter scores per court, and carry persistent ELO ratings across sessions. The newer connected version adds accounts, cloud backup, profiles, clubs, live rooms, QR/deep-link flows, and a PlayReffy landing site so regular groups can keep their roster, ratings, and match history moving across devices.

## Features

- Auto-balanced team pairing for every round using player ratings, recent partner history, opponent history, and fair sit-out rotation
- Flexible session setup for sports and formats such as badminton, pickleball, basketball, FIFA, singles, doubles, and larger team sizes
- Live per-court scoring with match timer support, autosave flows, round editing, and end-of-session confirmation
- Persistent ELO and Glicko-style ranked ratings with leaderboards, player profiles, trends, and match history
- Shareable recap cards, player cards, QR invites, profile claims, and deep-link fallbacks through playreffy.com
- Cloud backup and sync with Supabase-backed accounts, device identity, outbox handling, clubs, rooms, and online profile parity
- Companion Astro marketing site with App Store links, deep-link routes, legal pages, and product mockups
- Parallel SwiftUI iOS exploration with native design-system components, repositories, session screens, and scoring tests

## Challenges

- Designing pairing logic that balances competitive fairness, randomness, sit-out equity, and avoiding repeated teammates or opponents
- Keeping score entry fast enough for real games while preserving editability, validation, and session history
- Building offline-first local storage with SQLite and Zustand, then layering cloud backup and sync without breaking local play
- Coordinating deep links, QR scanning, rooms, clubs, profile claims, and App Store fallbacks across native and web surfaces
- Creating a sports-focused interface with large tap targets, readable live states, shareable visuals, and consistent branding

## Outcomes

- Built a substantial Expo/React Native mobile product that handles session setup, scoring, ratings, profiles, sharing, and sync
- Created a clear PlayReffy landing site and deep-link system for installation, profile claims, club joins, and room invites
- Developed broad automated coverage across scoring, pairing, sessions, sync, rooms, clubs, profiles, backup, and app bootstrap behavior
- Produced a reusable design language around the Reffy bullseye mark, sport-first cards, rounded controls, and readable stat surfaces
