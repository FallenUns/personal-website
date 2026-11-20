---
title: Blipt - Context-Aware Swift iOS Productivity App
summary: >-
  An intelligent iOS productivity app that combines natural-language capture, calendar integration,
  location awareness, and smart reminder delivery to surface tasks at the right moment.
category: Mobile
technologies:
  - Swift
  - SwiftUI
  - SwiftData
  - EventKit
  - CoreLocation
  - MapKit
  - NaturalLanguage
  - Core ML
  - Speech
  - UserNotifications
  - AlarmKit
  - Xcode
order: 0
featured: true
cover: blipt-icon.png
coverAlt: "Blipt app icon: a rounded blue glass shape with a dark blue outline"
links:
  - label: Join the TestFlight beta
    url: https://testflight.apple.com/join/e955N4fr
---

Blipt is a native Swift iOS productivity app designed around a simple but ambitious goal: reminders should appear when they are most useful, not just at a rigid fixed time. Instead of acting like a basic checklist, Blipt combines natural-language parsing, calendar awareness, location context, custom places, geofences, weather-aware logic, smart summaries, and adaptive reminder delivery to help users plan with less friction. The app supports both fast capture and deep configuration. Users can type or speak a reminder naturally, let the app extract date, time, duration, recurrence, intent, priority, checklist items, and contextual triggers, then rely on Blipt to decide whether that reminder should surface because they are near a location, leaving home, entering a free calendar gap, heading into rain, connecting to Wi-Fi, or approaching an event-relative moment like after dinner or before a meeting. Alongside reminder management, the app includes a calendar view, summary dashboard, morning briefings, evening reviews, import tools, saved places, diagnostics, and detailed settings for privacy and smart delivery behavior. The result is a mobile app that feels like a cross between a task manager, a context engine, and a daily planning assistant.

## Features

- Four core product areas: Reminders, Calendar, Summary, and Settings, organized in a native tab-based SwiftUI architecture
- Four-step onboarding flow covering welcome, permissions, location setup, and completion so the app can personalize context-aware behavior from first launch
- Fast reminder capture sheet designed for minimal friction, with support for quick creation before moving into advanced configuration
- Voice-first input through a speech capture flow so reminders can be created hands-free
- Natural-language parsing pipeline that extracts intent, title, date, time, end time, duration, recurrence, location, priority, urgency, subtasks, and context triggers from plain English
- Intent classification for distinguishing reminders from calendar events, with confidence scoring built into the parsing pipeline
- Support for explicit dates and times such as today, tomorrow, weekdays, clock times, and richer scheduling phrases
- Support for relative time phrases such as "in 30 minutes", "in 2 hours", and "in 3 days"
- Support for time-of-day phrases such as morning, afternoon, evening, and tonight
- Support for time ranges such as "2pm-4pm" or "from 2pm to 4pm" when creating event-like items
- Support for deadline semantics such as "before 5pm" or "by Friday", distinguishing deadlines from ordinary scheduled reminders
- Support for recurrence patterns including daily, weekdays, weekly, biweekly, monthly, and richer custom recurrence intervals such as every 3 days or every 2 hours
- Priority and urgency extraction from natural phrasing, including power-user shortcuts such as !urgent and !high
- Automatic task categorization into semantic groups such as deep work, errand, health, personal, social, and quick wins
- Inline checklist parsing so a single reminder can be converted into a task with multiple sub-items
- Parsed pill UI that visually surfaces extracted attributes like date, time, recurrence, urgency, and context conditions before save
- Reminder categories with custom names, icons, colors, sort order, and passive-mode behavior
- Category cards with progress rings, active counts, overdue badges, and contextual metadata for linked events or places
- Dedicated reminder detail screen with schedule metadata, notes, checklist progress, priority controls, linked event info, and actionable controls
- Checklist/subtask support stored per reminder, with progress tracking and completion state
- Date, time, duration, repeat interval, and urgent alarm configuration through an advanced detail sheet
- Support for location-aware reminders using home, work, school, or user-defined custom places
- Saved places system with custom icons, addresses, geofence radii, and edit/delete support
- Geofence-enabled reminders that can trigger when nearby, on arrival, on departure, or while at a relevant place
- Departure-trigger reminders for flows such as leaving home, leaving work, or leaving the current place
- Context-condition reminders that can react to states like rain, Wi-Fi availability, or free time
- Event-relative triggers such as before a meeting, after a meeting, after dinner, after breakfast, or before bed
- Map-backed reminder details that visualize saved locations and geofence coverage directly in the app
- Apple Maps and Google Maps handoff from reminder detail screens for real-world navigation to a task location
- Calendar integration powered by EventKit, including event fetching, viewing, creation, editing, and moving within the app
- Calendar tab with both timeline and list modes so users can switch between a time-based day view and a structured list view
- Drag-and-edit style calendar interactions, including handling for recurring event time changes
- Deep linking from calendar items back into reminder categories for fast navigation between planning surfaces
- Summary dashboard that presents a smart day card, weather forecast, smart suggestions, weekly completion stats, and upcoming reminders
- Weather-aware summary content that shows conditions, feels-like temperature, umbrella advice, and context-sensitive daily guidance
- Smart Suggestions module that surfaces reminders based on delivery reason and confidence score rather than simple chronological order
- Smart Delivery engine that evaluates reminder timing using context such as location proximity, direction, overdue status, calendar gaps, event timing, and other situational signals
- Context gating options such as suppress while driving, weather gating, and calendar gap suggestions to keep notifications timely and less disruptive
- Quiet Hours support so smart notifications and summaries respect user-defined lower-noise windows
- Morning briefing notifications that summarize today’s workload, top priorities, upcoming calendar events, and weather context
- Evening review notifications that reflect completed work, carry-over items, and tomorrow’s outlook
- Adaptive briefing learner that can adjust briefing timing instead of relying only on static default hours
- Import flow for bringing items in from Apple Reminders, grouped by list and importable into chosen Blipt categories
- Permissions management for notifications, alarms, location, calendar, and motion to support the app’s context-aware logic
- Places settings for home, work, school, and custom saved places, plus Wi-Fi confirmation to improve indoor context resolution
- Context pills that surface live state like location, weather, and calendar availability inside the UI
- Appearance settings, diagnostics screens, and notification/debug tooling to make the app easier to tune, validate, and maintain
- Persistent local data architecture using SwiftData models for reminders, categories, checklist items, saved places, context events, and learning signals

## Challenges

- Designing a reminder experience that feels simple on the surface while supporting a large number of advanced behaviors underneath
- Building a natural-language parser that handles real user phrasing across dates, times, recurrence, urgency, location, and context without leaving noisy text in the final title
- Coordinating multiple iOS frameworks such as SwiftData, EventKit, CoreLocation, MapKit, Speech, UserNotifications, NaturalLanguage, and Core ML inside one coherent product experience
- Balancing proactive reminder intelligence with user trust, so notifications feel helpful rather than intrusive or random
- Making context-aware delivery reliable when signals like location, motion, weather, calendar state, and permissions can all change independently
- Handling edge cases around geofence behavior, recurring events, deadline semantics, event-relative timing, and imported reminder data
- Creating a flexible reminder model that supports both quick capture and advanced manual editing without duplicating business logic
- Keeping the UI polished and approachable even though the app supports passive lists, context pills, diagnostics, places management, calendar editing, and multiple notification strategies
- Testing a large NLP and reminder-scheduling surface area, which required dedicated parser, scheduling, diagnostics, reliability, and adaptive-learning test coverage

## Outcomes

- Built a significantly more advanced mobile project than a standard reminder app, demonstrating product thinking as well as engineering depth
- Created an end-to-end iOS system spanning capture, parsing, persistence, scheduling, context modeling, notification delivery, summaries, and settings
- Demonstrated practical experience integrating multiple Apple platform capabilities into one cohesive user experience
- Developed a feature set substantial enough to support a strong project-detail case study on the portfolio
- Established a strong foundation for future polish, including screenshots, App Store distribution, expanded diagnostics, and richer smart-delivery refinement
