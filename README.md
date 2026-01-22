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

## 🔘 Button Hierarchy & UX Design

This project applies a clear button hierarchy to guide user actions
and reduce the risk of misoperation.

### 1. Primary Action (Main CTA)
Used for the most important action on the page.

- Examples: `新增`, `更新`
- Style: Solid primary color (purple)
- Design intent:
  - Draw immediate attention
  - Only one primary action is visible at a time
  - Represents the main user flow

### 2. Secondary Action
Used for supportive or frequently-used actions that should not compete
with the primary action.

- Examples: `匯出 CSV`
- Style: Outline / ghost button using the same primary color
- Design intent:
  - Clearly available but visually lightweight
  - Maintains consistency without stealing focus

### 3. Destructive / Cancel Action
Used for actions that interrupt the current flow or may cause data loss.

- Examples: `清空全部`, `取消`
- Style:
  - Red for destructive actions
  - Gray for cancel actions
- Design intent:
  - Provide strong visual warning
  - Encourage users to pause and confirm their intention

This hierarchy improves usability, prevents accidental operations,
and reflects real-world product design principles commonly used in
production applications.

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
