# Expense Tracker
 
A single-page personal expense tracker built with plain HTML, CSS, and JavaScript — no frameworks.
 
## Features
 
- **Add expenses** with description, amount, category, and date
- **Form validation** — rejects empty descriptions, zero/negative amounts, and missing dates
- **Delete** any expense with a single click
- **Filter** expenses by category (Food, Transport, Entertainment, Housing, Other)
- **Sort** by date or amount, ascending or descending
- **Running totals** — overall total, per-category breakdown, and expense count, all reflecting the current filter
- **Empty state** — friendly message when no expenses match
- **localStorage persistence** — your data survives page refreshes
- **Currency conversion** — converts the current total to EUR via a live exchange-rate API
## How to Run
 
1. Clone the repo
2. Open `index.html` in any browser — no install step needed
## Tech
 
- HTML5, CSS3, vanilla JavaScript (ES6+)
- `localStorage` for persistence
- `fetch` + `async/await` for the currency conversion API
## Assignment
 
CSCI 39548 — Practical Web Development, Hunter College, Summer 2026
 