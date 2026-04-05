# 💰 Budget Tracker

A minimal personal finance tracker built with vanilla HTML, CSS, and JavaScript. No frameworks, no build tools — just clean code and a mocha dark aesthetic.

---

## Preview

> Mocha dark theme · ledger-line background · JetBrains Mono + Playfair Display typography

---

## Features

- Add income and expense transactions with category and date
- Summary cards for total income, expenses, and balance
- Expense ratio progress bar
- Donut chart (Chart.js) showing spending by category
- Category breakdown with proportional bars
- Delete individual entries or clear all
- Data persists via `localStorage` — survives page refresh

---

## Project Structure

```
budget-tracker/
├── index.html
├── css/
│   └── style.css
└── js/
    └── app.js
```

---

## Getting Started

No installation needed. Just open `index.html` in your browser.

Or use VS Code Live Server:

1. Open the project folder in VS Code
2. Right-click `index.html` → **Open with Live Server**

---

## Built With

- Vanilla JavaScript
- [Chart.js 4](https://www.chartjs.org/) via CDN
- [Google Fonts](https://fonts.google.com/) — Playfair Display + JetBrains Mono
- `localStorage` for persistence

---

## Pushing to GitHub

```bash
git init
git add .
git commit -m "init: budget tracker"
gh repo create budget-tracker --public --source=. --push
```

---

*Built as a JavaScript practice project.*
