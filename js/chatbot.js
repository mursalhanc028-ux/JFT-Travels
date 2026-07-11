// ==========================================================================
// JFT TRAVELS — chatbot.js
// Frontend for the chat widget. Sends messages to a backend endpoint
// (see /server) which calls the Anthropic API with a scoped system prompt.
//
// IMPORTANT: change CHAT_API_URL below to your deployed backend URL once
// you host server/server.js somewhere (Render, Railway, Fly.io, etc).
// While testing locally, run the server and keep this pointed at
// http://localhost:3000/api/chat
// ==========================================================================
const CHAT_API_URL = "http://localhost:3000/api/chat";

let chatHistory = []; // { role: "user" | "assistant", content: string }

document.addEventListener("DOMContentLoaded", () => {
  const fab = document.getElementById("chatFab");
  const panel = document.getElementById("chatPanel");
  const closeBtn = document.getElementById("chatCloseBtn");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const messages = document.getElementById("chatMessages");
  const navChatBtn = document.getElementById("chatOpenBtn");

  function openChat() {
    panel.hidden = false;
    input.focus();
  }
  function closeChat() {
    panel.hidden = true;
  }

  fab.addEventListener("click", () => {
    panel.hidden ? openChat() : closeChat();
  });
  closeBtn.addEventListener("click", closeChat);
  navChatBtn.addEventListener("click", openChat);

  // Triggered by main.js when someone clicks "Inquire via Chat" on an Umrah card
  window.addEventListener("jft:openChatWithMessage", (e) => {
    openChat();
    input.value = e.detail;
    input.focus();
  });

  function appendMessage(text, sender) {
    const div = document.createElement("div");
    div.className = `chat-msg chat-msg-${sender}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function showTyping() {
    const div = document.createElement("div");
    div.className = "chat-msg-typing";
    div.id = "chatTypingIndicator";
    div.innerHTML = "<span></span><span></span><span></span>";
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
  function hideTyping() {
    const el = document.getElementById("chatTypingIndicator");
    if (el) el.remove();
  }

  async function sendMessage(text) {
    appendMessage(text, "user");
    chatHistory.push({ role: "user", content: text });
    showTyping();

    try {
      const res = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory })
      });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      hideTyping();

      const reply = data.reply || "Sorry, I couldn't get a response right now. Please call us at 0301-7674018.";
      appendMessage(reply, "bot");
      chatHistory.push({ role: "assistant", content: reply });
    } catch (err) {
      hideTyping();
      appendMessage(
        "I'm having trouble connecting right now. Please call/WhatsApp us at 0301-7674018 for immediate help.",
        "bot"
      );
      console.error("Chatbot error:", err);
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    sendMessage(text);
  });
});
