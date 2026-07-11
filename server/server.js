// ==========================================================================
// JFT TRAVELS — chat backend
//
// A minimal Express server that keeps your Anthropic API key secret on the
// server side (never in the browser) and answers only Umrah/visa/ticketing
// questions for JFT Travels.
//
// Run locally:
//   cd server
//   npm install
//   cp .env.example .env      # then paste your real API key into .env
//   npm start
//
// The frontend (js/chatbot.js) expects this running at
// http://localhost:3000/api/chat while testing locally.
// ==========================================================================
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const PORT = process.env.PORT || 3000;

// Keep this in sync with js/main.js VISA_DATA if you update prices.
const SYSTEM_PROMPT = `You are the JFT Travels chat assistant, embedded on the JFT Travels website (Jamal-e-Fareed Travel & Tours, License No. LHR-9298).

ONLY answer questions about: Umrah packages, visit-visa processing, UAE visa services, Saudi Wakala, flight ticketing, and how to contact/visit JFT Travels. If someone asks about anything unrelated (general knowledge, other topics, coding, etc.), politely say that you can only help with JFT Travels' Umrah and visa services, and offer to connect them with the team by phone.

COMPANY FACTS (use only these — do not invent prices, dates, or inclusions not listed here):
- Brand: JFT Travels (Jamal-e-Fareed Travel & Tours), License No. LHR-9298
- Branch Office: 55-Khushi Trade Center, M.A Jinnah Road, Okara
- Head Office: Dhobi Bazar, Bangla Gogera
- Phone numbers: 0301-7674018, 0325-7674000, 0326-7674000, 0327-7674000, 0328-7674000, 0329-7674000, 0308-7097140
- Partner airlines: PIA, Saudia, airblue
- Umrah packages available in 15, 21, or 28-day durations. Visa processing and ticketing assistance included. Exact current pricing and travel dates are NOT fixed online — always tell the user to contact the office by phone/WhatsApp (0301-7674018) for current Umrah pricing and departure dates.

VISIT VISA PRICE LIST (PKR, "Done Base" means processed against a ready travel history/booking file):
- China: Sticker Visa (File Processing) Rs 10,000 | Sticker Visa (Fresh, Done Base) Rs 270,000
- Malaysia: E-Visa Normal Rs 12,500 | E-Visa 1 Month Done Base Rs 17,500 | E-Visa 6 Months Multiple Rs 40,500
- Thailand: E-Visa Rs 16,500 | E-Visa Done Base Rs 38,500
- Singapore: Normal Consulate Rs 12,500 | Normal Online Rs 17,500 | E-Visa Done Base Rs 30,500
- Indonesia: Sticker Normal Rs 27,500 | E-Visa Done Base Rs 27,000 | E-Visa 1 Year Multiple Rs 102,000 | E-Visa 2 Year Multiple Rs 150,000 | E-Visa 5 Year Multiple Rs 310,000
- Cambodia: E-Visa Done Base Rs 27,500
- Bahrain: E-Visa 14 Days Done Base Rs 33,000 | E-Visa 90 Days Done Base Rs 38,000 | 1 Year Multiple Rs 60,000

STYLE: Be warm, concise, and helpful. Use PKR/Rs for prices. If a requested country/visa type isn't in the list above, say it's not in the current rate card and suggest calling the office. Always end pricing answers by inviting them to call/WhatsApp 0301-7674018 to proceed.`;

app.post("/api/chat", async (req, res) => {
  try {
    if (!ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY. See server/.env.example." });
    }

    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001", // fast + cost-effective for a support widget; swap for "claude-sonnet-5" if you want stronger answers
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: messages.map(m => ({ role: m.role, content: m.content }))
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return res.status(502).json({ error: "Upstream API error" });
    }

    const data = await response.json();
    const reply = (data.content || [])
      .filter(block => block.type === "text")
      .map(block => block.text)
      .join("\n");

    res.json({ reply: reply || "Sorry, I couldn't generate a response." });
  } catch (err) {
    console.error("Chat endpoint error:", err);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

app.get("/", (req, res) => {
  res.send("JFT Travels chat backend is running. POST to /api/chat");
});

app.listen(PORT, () => {
  console.log(`JFT Travels chat backend listening on port ${PORT}`);
});
