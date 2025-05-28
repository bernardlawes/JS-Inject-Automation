# 🧩 Social Media Browser Automation - A JS Injection Toolkit

A collection of browser extension scripts that automate repetitive actions on websites, like social media platforms, using injected JavaScript. Each automation is packaged as a self-contained extension with a `manifest.json`, `content.js`, and `icon.png`.

> ⚠️ Use responsibly and only on accounts you control. This project is not affiliated with any of the platforms it targets.

---

## 🔧 Features by Platform

### 📘 Facebook
Organized into separate tools under `/facebook/`:
- `comments/`: Bulk delete comment history from Activity Log
- `timeline/`: Hide or delete timeline posts (e.g. Reels, status updates)
- `activity-posts/`: Set audience visibility to "Only Me" from Activity Log

### ✅ Logging
All of the automations include logging, and enabled to automatically downloaid  these logs as json files, after a specified number of log entries.

### 📺 YouTube
- `delete_comments/`: Remove comment history from [myactivity.google.com](https://myactivity.google.com)
- `delete_livechat/`: Clear live chat logs

### 📸 Instagram
- `delete_comments/`: Delete comments in bulk from Activity Log, with export and batching

### 🧵 Threads
- `delete_replies/`: Remove replies from your `threads.com` profile feed

### 🐦 Twitter / X
- `delete_replies/`: Bulk delete replies using UI injection and scrolling logic

---

## 🚀 How to Use (as Browser Extension)

Each tool is a standalone extension. To use one:

1. Open Chrome/Edge and go to `chrome://extensions/`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the folder for the tool you want to use (e.g. `facebook/comments/`)
5. Navigate to the relevant social media page (e.g. Facebook Activity Log)
6. The extension's floating UI should appear

> ✅ All extensions include a `Start` and `Stop` button injected into the page

---

## 💡 Alternate Usage (Manual Console Injection)

If preferred, you can copy the contents of any `content.js` and paste it into the browser console:

1. Navigate to the correct page (e.g. Facebook → Activity Log → Comments)
2. Press `F12` → Console tab
3. Paste the code from `content.js`
4. Press Enter to run

---

## 🗂 Folder Structure

```plaintext
/automations
│
├── facebook/
│   ├── comments/
│   │   ├── content.js
│   │   ├── manifest.json
│   │   └── icon.png
│   ├── timeline/
│   │   ├── content.js
│   │   ├── manifest.json
│   │   └── icon.png
│   ├── activity-posts/
│   │   ├── content.js
│   │   ├── manifest.json
│   │   └── icon.png
│
├── youtube/
│   ├── delete_comments/
│   │   ├── content.js
│   │   ├── manifest.json
│   │   └── icon.png
│   ├── delete_livechat/
│   │   ├── content.js
│   │   ├── manifest.json
│   │   └── icon.png
│
├── instagram/
│   └── delete_comments/
│       ├── content.js
│       ├── manifest.json
│       └── icon.png
│
├── threads/
│   └── delete_replies/
│       ├── content.js
│       ├── manifest.json
│       └── icon.png
│
├── twitter/
│   └── delete_replies/
│       ├── content.js
│       ├── manifest.json
│       └── icon.png
│
└── README.md

📁 Logs & Exports
Most tools support:

✅ Deleted comment/post export (JSON format)

❌ Skipped items log with reasons (e.g. error, UI change)

⏱ Batch download every N deletions or on Stop

📜 License
MIT License — Free for personal use, modification, and contribution with attribution.

📬 Contributing
Pull requests welcome for:

Fixes to broken selectors

New platform support

UX improvements (floating UI, feedback, error handling)

🙋 FAQ
Q: Can this break if the UI changes?
Yes — DOM changes can affect selectors. Open an issue or inspect the HTML if your automation stops working.

Q: Will this get me banned?
Use at your own risk. These tools simulate user actions with delays but are still automation.

Q: Can I combine all tools into one extension?
You could, but I recommend keeping them separate for clarity and targeted deployment.
