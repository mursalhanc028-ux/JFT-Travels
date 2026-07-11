// ==========================================================================
// JFT TRAVELS — main.js
// Visa package data, rendering, search/filter, nav toggle, scroll reveals.
// ==========================================================================

// Source data taken directly from the JFT Travels visa rate card.
// Edit this array to update prices — it is the single source of truth
// for the Visa Packages section, and is also shared with the chatbot's
// backend system prompt (see server/server.js) so keep the two in sync.
const VISA_DATA = [
  {
    country: "China", flag: "🇨🇳",
    visas: [
      { type: "Sticker Visa (File Processing)", price: "10,000" },
      { type: "Sticker Visa (Fresh, Done Base)", price: "270,000" }
    ]
  },
  {
    country: "Malaysia", flag: "🇲🇾",
    visas: [
      { type: "E-Visa (Normal)", price: "12,500" },
      { type: "E-Visa 1 Month, Done Base", price: "17,500" },
      { type: "E-Visa 6 Months Multiple", price: "40,500" }
    ]
  },
  {
    country: "Thailand", flag: "🇹🇭",
    visas: [
      { type: "E-Visa", price: "16,500" },
      { type: "E-Visa, Done Base", price: "38,500" }
    ]
  },
  {
    country: "Singapore", flag: "🇸🇬",
    visas: [
      { type: "Normal Consulate", price: "12,500" },
      { type: "Normal Online", price: "17,500" },
      { type: "E-Visa, Done Base", price: "30,500" }
    ]
  },
  {
    country: "Indonesia", flag: "🇮🇩",
    visas: [
      { type: "Sticker Normal", price: "27,500" },
      { type: "E-Visa, Done Base", price: "27,000" },
      { type: "E-Visa, 1 Year Multiple", price: "102,000" },
      { type: "E-Visa, 2 Year Multiple", price: "150,000" },
      { type: "E-Visa, 5 Year Multiple", price: "310,000" }
    ]
  },
  {
    country: "Cambodia", flag: "🇰🇭",
    visas: [
      { type: "E-Visa, Done Base", price: "27,500" }
    ]
  },
  {
    country: "Bahrain", flag: "🇧🇭",
    visas: [
      { type: "E-Visa 14 Days, Done Base", price: "33,000" },
      { type: "E-Visa 90 Days, Done Base", price: "38,000" },
      { type: "1 Year Multiple", price: "60,000" }
    ]
  }
];

function renderVisaGrid(filter = "") {
  const grid = document.getElementById("visaGrid");
  if (!grid) return;
  const q = filter.trim().toLowerCase();
  const filtered = VISA_DATA.filter(c => c.country.toLowerCase().includes(q));

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="visa-empty">No matching country. Try "China", "Malaysia", "Bahrain"...</p>`;
    return;
  }

  grid.innerHTML = filtered.map(c => `
    <article class="visa-card reveal is-visible">
      <div class="visa-card-head">
        <span class="visa-flag">${c.flag}</span>
        <h3>${c.country}</h3>
      </div>
      <ul class="visa-rows">
        ${c.visas.map(v => `
          <li>
            <div class="visa-row">
              <span class="visa-type">${v.type}</span>
              <span class="visa-price">Rs ${v.price}</span>
            </div>
          </li>
        `).join("")}
      </ul>
    </article>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Render visa cards
  renderVisaGrid();

  // Visa search filter
  const searchInput = document.getElementById("visaSearch");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => renderVisaGrid(e.target.value));
  }

  // Mobile nav toggle
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    mainNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Umrah "Inquire via Chat" buttons open the chat widget with a prefilled question
  document.querySelectorAll(".umrah-inquire").forEach(btn => {
    btn.addEventListener("click", () => {
      const days = btn.closest(".umrah-card").querySelector(".umrah-days").textContent;
      window.dispatchEvent(new CustomEvent("jft:openChatWithMessage", {
        detail: `I'm interested in the ${days}-day Umrah package. Can you tell me more?`
      }));
    });
  });

  // Scroll reveal for sections
  const revealTargets = document.querySelectorAll(".section, .hero");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealTargets.forEach(el => { el.classList.add("reveal"); io.observe(el); });
});
