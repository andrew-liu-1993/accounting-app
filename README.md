# Accounting App (V0 → V1)

A vanilla JavaScript accounting app built with **state-driven rendering** and **incremental feature design**.

**Live Demo:** https://andrew-liu-1993.github.io/accounting-app/

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
  - All records are stored in `state.records`
- **State-driven Rendering**
  - UI is fully derived from state (list and summary)
- **Incremental Iteration**
  - Features are added without breaking existing logic

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

---

## 📌 Future Improvements

- Edit existing records
- Export data as CSV
- Monthly charts and trends
- Category management
- Refactor to modular structure
