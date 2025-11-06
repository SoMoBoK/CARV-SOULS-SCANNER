// app.js — CARV Soul Scanner hybrid version
// Connects to Backpack or Metamask + generates local AI-style insights

const connectBtn = document.getElementById("connectWallet");
const scanBtn = document.getElementById("scanSoul");
const walletInfo = document.getElementById("walletInfo");
const soulPoints = document.getElementById("soulPoints");
const insightEl = document.getElementById("insight");
const shareBtn = document.getElementById("shareX");

let walletAddress = "";
let soulScore = 0;

// Local random AI-style insights
const localInsights = [
  "Your data sparkles with rare potential — keep going.",
  "You’re building something the future will remember.",
  "The on-chain winds favor those who listen to their code.",
  "Your digital aura hums with creative energy.",
  "You are one commit away from greatness.",
  "The CARVverse feels your frequency rising.",
  "Your blockchain footprint whispers of legend.",
  "Sovereignty suits your soul — you were made for this.",
  "A data storm brews… and you’re at its calm center.",
  "Your energy syncs with the rhythm of innovation.",
  "Your code resonates beyond the blockchain.",
  "Your soul emits a strong decentralization signal.",
  "You radiate sovereign intelligence.",
  "The network remembers those who build with intent.",
  "A new layer of you has been minted — unique and eternal.",
  "CARV sees potential in your sovereignty.",
  "Your essence aligns with the next AI epoch.",
  "Each scan refines your digital being.",
  "There’s light in your ledger.",
  "Your soul score is more than numbers — it’s proof of becoming."
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

// Connect wallet logic (Backpack first, fallback to MetaMask)
connectBtn.addEventListener("click", async () => {
  try {
    if (window.backpack) {
      const response = await window.backpack.connect();
      walletAddress = response.publicKey.toString();
      walletInfo.innerText = `Backpack: ${walletAddress}`;
    } else if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      walletAddress = accounts[0];
      walletInfo.innerText = `MetaMask: ${walletAddress}`;
    } else {
      walletInfo.innerText = "No compatible wallet found.";
      alert("Install Backpack or MetaMask to continue.");
      return;
    }
  } catch (error) {
    console.error(error);
    walletInfo.innerText = "Wallet connection failed.";
  }
});

// Scan Soul logic (generates score + random insight)
scanBtn.addEventListener("click", async () => {
  if (!walletAddress) {
    alert("Connect your wallet first!");
    return;
  }

  // Random soul score
  soulScore = Math.floor(Math.random() * 1000) + 100;

  // Random local AI-style insight
  const randomInsight = localInsights[Math.floor(Math.random() * localInsights.length)];

  // Display results
  soulPoints.innerText = `🌟 Soul Points: ${soulScore} pts`;
  insightEl.innerText = `💫 Insight: ${randomInsight}`;
});

// Share on X button
shareBtn.addEventListener("click", () => {
  const tweetText = encodeURIComponent(
    `Just scanned my soul on CARV 🧠\nWallet: ${walletAddress}\nSoul Points: ${soulScore} pts\n${insightEl.innerText}\n\n@CashieCarv may reply with a deeper insight ✨`
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
  window.open(tweetUrl, "_blank");
});
