# Accounting App (V0 → V1)

A vanilla JavaScript accounting app built with **state-driven rendering** and **incremental feature design**.

This project focuses on building a maintainable front-end architecture rather than visual complexity.

---

## ✨ Features

### V0 (MVP)
- Add income / expense records
- Monthly summary (income / expense / balance)
- Record list rendering from a single source of truth
- Data persistence via localStorage

### V1 (Filters & Summary Sync)
- Filter records by:
  - Month
  - Type (income / expense)
  - Category
  - Keyword (note / category)
- Summary values update based on **filtered records**
- Reset filters to default state

---

## 🧠 Design Principles

- **Single Source of Truth**
  - All records stored in `state.records`
- **State-driven Rendering**
  - UI is fully derived from state
- **Incremental Iteration**
  - Features added without breaking existing logic

---

## 🛠 Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- localStorage
- Git / GitHub (feature branches & PR workflow)

---

## 🚀 How to Run Locally

1. Clone the repository
   ```bash
   git clone https://github.com/andrew-liu-1993/accounting-app.git
