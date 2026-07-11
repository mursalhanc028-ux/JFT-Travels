# JFT Travels — Website + AI Chat Assistant

A website for **JFT Travels** (Jamal-e-Fareed Travel & Tours, License LHR-9298) with:
- Home / About / Umrah Packages / Visa Packages (searchable) / Contact
- A floating chat assistant scoped to Umrah & visa questions only

```
jft-travels/
├── index.html          ← the whole website (one page, sectioned)
├── css/style.css        ← all styling
├── js/main.js           ← visa data + search + nav + scroll animation
├── js/chatbot.js        ← chat widget frontend
├── server/              ← small backend that talks to the Anthropic API
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
└── README.md
```

---

## Quick note (Roman Urdu)

- Website ka poora frontend code `index.html`, `css/`, `js/` mein hai — ye seedha GitHub Pages pe chal jayega, koi extra setup nahi chahiye.
- Chatbot ke liye ek chhota backend (`server/` folder) bhi hai, kyunke API key ko browser mein daalna unsafe hai. Ye backend kisi bhi Node hosting (Render, Railway) pe free mein chal sakta hai.
- Neeche step-by-step instructions hain — dono parts (website + backend) deploy karne ke liye.

---

## 1. Run it locally first (optional, to preview)

You need [Node.js](https://nodejs.org) installed (v18+).

**Start the chat backend:**
```bash
cd server
npm install
cp .env.example .env
# open .env and paste your real Anthropic API key from https://console.anthropic.com/
npm start
```
This runs on `http://localhost:3000`.

**Open the website:**
Just open `index.html` in your browser (or use a simple local server like the VS Code "Live Server" extension). The chat widget is already pointed at `http://localhost:3000/api/chat` in `js/chatbot.js`.

---

## 2. Push to GitHub

```bash
cd jft-travels
git init
git add .
git commit -m "Initial JFT Travels website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

Your API key is **not** included in the repo (`.env` is git-ignored) — you'll add it as a secret environment variable when you deploy the backend (step 4).

---

## 3. Deploy the website (frontend)

Easiest option: **GitHub Pages** (free).
1. On GitHub, go to your repo → **Settings → Pages**.
2. Under "Source", choose the `main` branch and `/ (root)` folder.
3. Save. Your site will be live at `https://YOUR-USERNAME.github.io/YOUR-REPO/` within a minute or two.

---

## 4. Deploy the chat backend

The backend must run somewhere that supports Node.js (GitHub Pages only serves static files, so it cannot run `server.js`). Good free/cheap options: **Render**, **Railway**, or **Fly.io**. Example using Render:

1. Create a free account at [render.com](https://render.com).
2. **New → Web Service** → connect your GitHub repo.
3. Set **Root Directory** to `server`.
4. **Build Command:** `npm install`  **Start Command:** `npm start`
5. Under **Environment**, add a variable:
   - `ANTHROPIC_API_KEY` = your real key
6. Deploy. Render will give you a URL like `https://jft-travels-chat.onrender.com`.

Then update the frontend to point at your live backend instead of localhost:

**In `js/chatbot.js`**, change:
```js
const CHAT_API_URL = "http://localhost:3000/api/chat";
```
to:
```js
const CHAT_API_URL = "https://jft-travels-chat.onrender.com/api/chat";
```
Commit and push this change so GitHub Pages picks it up.

---

## 5. Updating visa prices or Umrah info later

- **Visible on the website:** edit the `VISA_DATA` array at the top of `js/main.js`.
- **Chatbot's knowledge:** edit the `SYSTEM_PROMPT` text in `server/server.js` (the same facts, written as plain text for the AI).

Keep both in sync so the chatbot never quotes a different price than the page shows.

---

## Notes

- Never commit your real `.env` file or paste your API key directly into any `.html`/`.js` file that ships to the browser — that would let anyone read and misuse your key.
- The chatbot's system prompt restricts it to Umrah/visa/JFT Travels topics; it will politely decline unrelated questions and point people to your phone numbers instead.
- Contact numbers, addresses, and the CEO/Director names were taken from the JFT Travels promotional posters provided. Please double-check the "About" section's names/titles and correct them in `index.html` if anything is off.
