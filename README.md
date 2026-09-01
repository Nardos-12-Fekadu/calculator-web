# Ledger — a simple to-do list

A small, no-framework to-do list app built with plain HTML, CSS, and JavaScript. Tasks are saved in your browser's `localStorage`, so they're still there when you refresh the page.

## Features

- Add tasks
- Mark tasks as done / not done
- Delete individual tasks
- Clear all completed tasks at once
- Tasks persist across page reloads (no backend needed)

## Running it locally

No build step or dependencies required. Just open `index.html` in a browser, or serve the folder with any static server, e.g.:

```bash
npx serve .
```

## Files

- `index.html` — page structure
- `style.css` — styling
- `script.js` — app logic (adding, toggling, deleting, saving tasks)

## Putting this on GitHub

1. Create a new repository on GitHub (no README/license needed, we already have one).
2. In this folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: to-do list app"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
   git push -u origin main
   ```
3. (Optional) Turn on **GitHub Pages** in the repo's Settings → Pages, set the source to the `main` branch, and you'll get a free live link to share.

## Ideas to extend it

- Add due dates
- Add categories or tags
- Drag-and-drop reordering
- Sync tasks to a real backend instead of localStorage
