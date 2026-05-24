const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const socialLinks = {
  instagram: "https://www.instagram.com/mcex.ng",
  x: "",
  telegram: "https://t.me/Bigmilly01"
};
const whatsappLink = "https://wa.me/2347077719341";

document.querySelectorAll("[data-social]").forEach((link) => {
  const platform = link.dataset.social;
  if (socialLinks[platform]) link.href = socialLinks[platform];
});

document.querySelectorAll("a[href*='wa.me'], a[href*='channel=whatsapp']").forEach((link) => {
  link.href = whatsappLink;
  link.removeAttribute("target");
  link.removeAttribute("rel");
});

document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = whatsappLink;
  });
});

const requestedPlatform = new URLSearchParams(location.search).get("platform");
if (requestedPlatform && socialLinks[requestedPlatform]) {
  location.href = socialLinks[requestedPlatform];
}

if (localStorage.getItem("milly-theme") === "light") {
  document.body.classList.add("light");
}

function updateThemeLabels() {
  const label = document.body.classList.contains("light") ? "Light" : "Dark";
  document.querySelectorAll(".theme-toggle strong").forEach((el) => {
    el.textContent = label;
  });
}

updateThemeLabels();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.14 });

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

document.querySelectorAll(".theme-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem("milly-theme", document.body.classList.contains("light") ? "light" : "dark");
    updateThemeLabels();
  });
});

async function updateLiveTicker() {
  const tickerItems = document.querySelectorAll("[data-symbol]");
  if (!tickerItems.length) return;
  const ids = [...new Set([...tickerItems].map((item) => item.dataset.symbol))].join(",");
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`, { cache: "no-store" });
    if (!response.ok) throw new Error("Price feed unavailable");
    const data = await response.json();
    tickerItems.forEach((item) => {
      const coin = data[item.dataset.symbol];
      if (!coin) return;
      const price = coin.usd >= 1
        ? coin.usd.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
        : coin.usd.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 4 });
      const change = Number(coin.usd_24h_change || 0);
      item.querySelector("strong").textContent = price;
      item.querySelector("em").textContent = `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
      item.querySelector("em").className = change >= 0 ? "price-up" : "price-down";
    });
  } catch (error) {
    tickerItems.forEach((item) => {
      item.querySelector("strong").textContent = "Live soon";
      item.querySelector("em").textContent = "feed";
    });
  }
}

updateLiveTicker();
setInterval(updateLiveTicker, 60000);

document.querySelector(".chatbot")?.addEventListener("click", () => {
  document.querySelector(".chat-window").classList.toggle("open");
});

document.querySelector("[data-support-submit]")?.addEventListener("click", () => {
  const form = document.querySelector(".contact-form");
  const name = form?.querySelector("[name='name']")?.value.trim();
  const experience = form?.querySelector("[name='experience']")?.value;
  const query = new URLSearchParams({ name: name || "Guest", experience: experience || "Beginner" });
  window.location.href = `${whatsappLink}?text=${encodeURIComponent(`Hello Milly, my name is ${name || "Guest"}. I am a ${experience || "Beginner"} trader and I want crypto portfolio support.`)}`;
});

document.querySelector("[data-support-request]")?.addEventListener("click", () => {
  const name = document.querySelector("[name='supportName']")?.value.trim();
  const email = document.querySelector("[name='supportEmail']")?.value.trim();
  const type = document.querySelector("[name='supportType']")?.value;
  const message = document.querySelector("[name='supportMessage']")?.value.trim();
  const button = document.querySelector("[data-support-request]");

  if (!name || !message) {
    button.textContent = "Please add name and message";
    setTimeout(() => {
      button.textContent = "Submit Support Request";
    }, 1800);
    return;
  }

  const whatsappMessage = [
    "Hello Milly, I need customer support.",
    `Name: ${name}`,
    email ? `Email: ${email}` : "",
    `Support type: ${type}`,
    `Message: ${message}`
  ].filter(Boolean).join("\n");

  button.textContent = "Opening WhatsApp...";
  window.location.href = `${whatsappLink}?text=${encodeURIComponent(whatsappMessage)}`;
});

document.querySelector("[data-newsletter]")?.addEventListener("click", () => {
  const input = document.querySelector(".newsletter input");
  if (input?.value.trim()) {
    input.value = "";
    input.placeholder = "You are on Milly's market list";
  } else {
    input?.focus();
  }
});

const chatMessages = document.querySelector(".chat-messages");
const chatForm = document.querySelector(".chat-form");
const chatInput = document.querySelector(".chat-form input");

function supportReply(message) {
  const text = message.toLowerCase();
  if (text.includes("support") || text.includes("whatsapp") || text.includes("connect")) {
    return "I can connect you to customer support now. Open the support page to continue with WhatsApp, email support, or a portfolio request.";
  }
  if (text.includes("beginner")) {
    return "Great place to start. Milly can help you understand risk, basic portfolio allocation, and how to avoid emotional trades.";
  }
  if (text.includes("portfolio")) {
    return "For portfolio support, Milly reviews your goals, current assets, risk tolerance, and time horizon before suggesting a structured plan.";
  }
  if (text.includes("risk")) {
    return "Risk management usually starts with position sizing, stop levels, diversification, and only trading with capital you can afford to risk.";
  }
  return "Thanks. I recommend opening customer support so Milly can review your goals and guide you personally.";
}

function addChatMessage(text, type) {
  if (!chatMessages) return;
  const bubble = document.createElement("p");
  bubble.className = type === "user" ? "user-message" : "bot-message";
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendChatMessage(text) {
  const clean = text.trim();
  if (!clean) return;
  addChatMessage(clean, "user");
  setTimeout(() => addChatMessage(supportReply(clean), "bot"), 350);
}

document.querySelectorAll("[data-reply]").forEach((button) => {
  button.addEventListener("click", () => sendChatMessage(button.dataset.reply));
});

chatForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  sendChatMessage(chatInput.value);
  chatInput.value = "";
});

document.querySelectorAll(".magnetic").forEach((el) => {
  el.addEventListener("pointermove", (event) => {
    if (innerWidth < 760 || prefersReduced) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.08;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.08;
    el.style.transform = `translate(${x}px, ${y}px)`;
  });
  el.addEventListener("pointerleave", () => {
    el.style.transform = "";
  });
});

const counters = document.querySelectorAll("[data-count]");
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count);
    let current = 0;
    const step = Math.max(1, Math.round(target / 80));
    const tick = () => {
      current = Math.min(target, current + step);
      el.textContent = `${current}+`;
      if (current < target && !prefersReduced) requestAnimationFrame(tick);
    };
    tick();
    countObserver.unobserve(el);
  });
}, { threshold: 0.5 });

counters.forEach((counter) => countObserver.observe(counter));

function drawHeroChart() {
  const canvas = document.getElementById("heroChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(212, 175, 55, 0.12)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 52) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const candles = [118, 132, 104, 148, 138, 170, 156, 188, 172, 206, 198, 224, 214, 242, 232, 255];
  candles.forEach((value, index) => {
    const x = 32 + index * 36;
    const open = height - value + 24;
    const close = open + (index % 3 === 0 ? 28 : -24);
    const high = Math.min(open, close) - 22;
    const low = Math.max(open, close) + 24;
    const up = close < open;

    ctx.strokeStyle = up ? "#3be88a" : "#d4af37";
    ctx.fillStyle = up ? "rgba(59, 232, 138, 0.72)" : "rgba(212, 175, 55, 0.82)";
    ctx.beginPath();
    ctx.moveTo(x, high);
    ctx.lineTo(x, low);
    ctx.stroke();
    ctx.fillRect(x - 8, Math.min(open, close), 16, Math.abs(close - open));
  });

  const gradient = ctx.createLinearGradient(0, 50, width, 240);
  gradient.addColorStop(0, "rgba(212, 175, 55, 0.05)");
  gradient.addColorStop(1, "rgba(212, 175, 55, 0.7)");
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 4;
  ctx.beginPath();
  candles.forEach((value, index) => {
    const x = 32 + index * 36;
    const y = height - value + 20;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function animateBackground() {
  const canvas = document.getElementById("marketCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const resize = () => {
    canvas.width = canvas.offsetWidth * devicePixelRatio;
    canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  let frame = 0;
  const draw = () => {
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(212, 175, 55, 0.09)";
    ctx.lineWidth = 1;

    for (let x = -80; x < width + 80; x += 58) {
      ctx.beginPath();
      ctx.moveTo(x + (frame % 58), 0);
      ctx.lineTo(x - 180 + (frame % 58), height);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(212, 175, 55, 0.18)";
    ctx.beginPath();
    for (let x = 0; x < width; x += 28) {
      const y = height * 0.58 + Math.sin((x + frame) / 48) * 34 + Math.cos((x + frame) / 110) * 58;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    frame += 0.55;
    if (!prefersReduced) requestAnimationFrame(draw);
  };
  draw();
}

drawHeroChart();
animateBackground();
