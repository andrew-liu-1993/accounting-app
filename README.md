# Accounting App (V0 → V1)

A **state-driven accounting web application** built with vanilla JavaScript.

This project focuses on **practical front-end fundamentals and product-oriented
design decisions**, including CRUD workflows, filter-synced summaries,
destructive action handling, and UI consistency.
It is designed to reflect **real-world product behavior**, not demo-only features.

🔗 **Live Demo**  
https://andrew-liu-1993.github.io/accounting-app/

---

## ✨ Features

### V0 — Core Functionality
- Add income / expense records
- Monthly summary (income / expense / balance)
- Record list rendered from a single source of truth
- Data persistence via `localStorage`

### V1 — Filtering & Summary Sync
- Filter records by:
  - Month
  - Type (income / expense)
  - Category
  - Keyword (note / category)
- Summary values update based on **currently filtered records**
- Reset filters to default state

---

## 🧠 Architectural Approach

### Single Source of Truth
All application data is managed in a centralized state (`state.records`).
The UI is fully derived from state through explicit render functions.

### State-Driven Rendering
- Avoids hidden DOM state
- Keeps list view and summary logic predictable
- Simplifies future feature expansion

### Incremental Feature Design
Features are introduced iteratively without breaking existing behavior,
mirroring real-world product development practices.

---

## 🎯 UX-Oriented Design Decisions

### Explicit Edit Mode
Editing is implemented as a dedicated mode rather than inline mutation:
- Edit state is tracked explicitly
- Form behavior reflects current mode (Add / Update / Cancel)
- Clear visual distinction for records under editing

This reduces accidental overwrites and aligns with common CRUD product flows.

### Filter-Aware Summary Logic
Monthly summary values are calculated from **filtered data**, not raw records,
ensuring consistency between what users see and what is summarized.

### Destructive Action Handling
Destructive actions do not rely on native `alert()` dialogs.
Instead, the app uses an **in-app confirmation UI** that:
- Preserves context without blocking the interface
- Requires explicit confirmation
- Allows safe cancellation

This pattern reflects modern production UX standards.

---

## 🎨 UI Consistency & Design Foundations

A lightweight design system is applied to maintain consistency and clarity:
- Clear button hierarchy (primary / secondary / destructive / neutral)
- Strict color semantics for action intent
- Consistent spacing rules
- Right-aligned numeric values for financial readability

These foundations ensure that feature growth does not lead to UI inconsistency.

---

## 🛠 Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- `localStorage`
- Git / GitHub

---

## 🚀 Run Locally

```bash
git clone https://github.com/andrew-liu-1993/accounting-app.git
```
---

📌 Future Improvements
- Export records as CSV
- Monthly charts and trend visualization
- Category management
- Codebase modularization

👤 Target Roles
This project is intended to demonstrate fundamentals relevant to:
- Junior Front-End Engineer
- Entry to Mid-Level Front-End Engineer
- Product-Oriented Software Engineer

The emphasis is on state management, UI predictability, and UX-aware
engineering decisions, rather than framework-specific implementations.

