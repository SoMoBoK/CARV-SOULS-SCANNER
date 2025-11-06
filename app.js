// app.js — hybrid flow (local immediate insight + optional OpenAI via /api/ask)
// Paste into CARV-SOULS-SCANNER/app.js

// ---------- UI elements ----------
const connectBtn = document.getElementById("connectBtn");
const scanBtn = document.getElementById("scanBtn");
const walletEl = document.getElementById("wallet");
const resultBox = document.getElementById("resultBox");
const resultText = document.getElementById("resultText");
const spinner = document.getElementById("spinner");
const shareBtn = document.getElementById("shareBtn");
const carvAvatar = document.getElementById("carvAvatar");
const carvName = document.getElementById("carvName");
const carvProfile = document.getElementById("carvProfile");
const uidInput = document.getElementById("carvUid");

let connectedAddress = null;
let lastScore = null;
let lastInsight = null;
let lastUsedFallback = false;

// ---------------- Wallet detection (Backpack -> MetaMask -> OKX -> generic)
function getSolanaProvider() {
  if (window.backpack && window.backpack.ethereum) return window.backpack;
  if (window.solana && window.solana.isBackpack) return window.solana;
  if (window.solana && window.solana.isPhantom) return window.solana;
  return null;
}
function getEvmProvider() {
  if (window.ethereum && window.ethereum.isMetaMask) return window.ethereum;
  if (window.okxwallet && window.okxwallet.ethereum) return window.okxwallet.ethereum;
  if (window.ethereum) return window.ethereum;
  return null;
}

// ---------- Connect wallet ----------
connectBtn.addEventListener("click", async () => {
  try {
    const sol = getSolanaProvider();
    const evm = getEvmProvider();

    if (sol) {
      // Backpack/Solana path
      try {
        const res = await sol.connect();
        connectedAddress = res?.publicKey?.toString?.() || res?.toString?.() || res;
        walletEl.innerText = `Backpack: ${connectedAddress}`;
        scanBtn.disabled = false;
        return;
      } catch (e) {
        console.warn("Solana connect failed, falling back to EVM", e);
      }
    }

    if (evm) {
      const accs = await evm.request({ method: "eth_requestAccounts" });
      connectedAddress = accs && accs[0];
      walletEl.innerText = `EVM: ${connectedAddress}`;
      scanBtn.disabled = false;
      return;
    }

    alert("No supported wallet found. Please install Backpack or MetaMask.");
  } catch (err) {
    console.error("connect error:", err);
    alert("Failed to connect wallet: " + (err?.message || err));
  }
});

// ---------- Local templates (large pool) ----------
const LOCAL_TEMPLATES = [
  "Your chain energy hums with curiosity — a quiet builder in a loud world.",
  "A spark of vision lives in your transactions — keep sketching the future.",
  "You move like a quiet storm: consistent actions, dramatic results.",
  "The ledger remembers small brave moves — your legacy compounds.",
  "Explorer spirit detected: your curiosity will open new doors in Web3.",
  "You carry the patience of a long-term builder; your breakthrough is near.",
  "The code of your intent is strong — upgrade your habits, harvest results.",
  "Your on-chain story reads like a pioneer’s log — keep mapping new ground.",
  "Tuned to possibility — your next bold bet could rewire your trajectory.",
  "Sovereign energy: you prefer building over boasting, and that pays off.",
  "You balance risk and curiosity well — trust the process and iterate.",
  "Your digital shadow is full of small wins — they add up to greatness.",
  "You are a careful alchemist — you turn tiny inputs into rare outputs.",
  "A creative hacker at heart — your ideas are your real capital.",
  "You remix trust and community like an artist — keep sharing the craft.",
  "Your code-of-life values durability over flash — that wins markets.",
  "You build with heart and metrics — rare, and quietly powerful.",
  "On-chain momentum is gathering around you — keep pushing the lever.",
  "The ecosystem notices consistent contributors — you’re one of them.",
  "You learn fast and ship faster — that rhythm is your competitive edge.",
  "You are the kind of builder who plants trees for future planets.",
  "Small acts of generosity coded your reputation — it will return to you.",
  "You thrive in ambiguity — use that to create new categories.",
  "Your curiosity is a compass; follow it into useful experimentation."
];

// ---------- Utility: deterministic-ish score from wallet ----------
function generateSoulScore(address) {
  if (!address) return Math.floor(Math.random() * 1000) + 1;
  let h = 0;
  for (let i = 0; i < address.length; i++) h = (h << 5) - h + address.charCodeAt(i);
  h = Math.abs(h);
  return (h % 1000) + 1;
}

// ---------- Call /api/ask (tries OpenAI, fallback server-side too) ----------
async function callApiAsk(carvUid, address, score) {
  try {
    const resp = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carvUid, walletAddress: address, soulScore: score })
    });
    if (!resp.ok) {
      console.warn("API returned non-OK", resp.status);
      return null;
    }
    const json = await resp.json();
    // expected { insight, fallback: true/false }
    return json;
  } catch (err) {
    console.error("callApiAsk error", err);
    return null;
  }
}

// ---------- Scan button flow ----------
scanBtn.addEventListener("click", async () => {
  if (!connectedAddress) return alert("Connect wallet first");

  const carvUid = (uidInput?.value || "").trim() || null;
  resultBox.style.display = "block";
  spinner.style.display = "block";
  resultText.innerHTML = "Scanning your soul...";

  // show quick local profile + avatar
  carvProfile.style.display = "block";
  carvAvatar.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(connectedAddress)}`;
  carvName.innerText = "CARVer " + (connectedAddress.slice ? connectedAddress.slice(-6) : "guest");

  // generate score
  const score = generateSoulScore(connectedAddress);
  lastScore = score;

  // Immediately show a local insight so UX is instant
  const local = LOCAL_TEMPLATES[Math.floor(Math.random() * LOCAL_TEMPLATES.length)];
  resultText.innerHTML = `<b>CARV UID:</b> ${carvUid || "Not provided"}<br><b>Soul Score:</b> ${score}<br><br>✨ <i>${local} (instant local insight)</i>`;
  lastInsight = local;
  lastUsedFallback = true;
  spinner.style.display = "none";

  // Meanwhile, call the backend to try for a richer insight (OpenAI preferred)
  // If the backend returns a better insight, update the UI
  const apiResult = await callApiAsk(carvUid, connectedAddress, score);
  if (apiResult && apiResult.insight) {
    lastInsight = apiResult.insight;
    lastUsedFallback = Boolean(apiResult.fallback);
    resultText.innerHTML = `<b>CARV UID:</b> ${carvUid || "Not provided"}<br><b>Soul Score:</b> ${score}<br><br>✨ <i>${apiResult.insight}${apiResult.fallback ? " (offline fallback)" : ""}</i>`;
  }
});

// ---------- Share on X: tag @CashieCarv for public deeper reply ----------
shareBtn.addEventListener("click", () => {
  if (!lastInsight || !lastScore) {
    alert("Scan first to generate a result, then share to call @CashieCarv.");
    return;
  }

  // Pre-fill tweet and tag @CashieCarv asking for a deeper reply
  const short = connectedAddress?.slice(0, 6) + "..." + connectedAddress?.slice(-4);
  const text = `I just scanned my CARV Soul on @carv_official 🔮\nSoul Score: ${lastScore}\nInsight: ${lastInsight}\n@CashieCarv please reply with a deeper insight 💫 #CARV #SovereignAI`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
});
