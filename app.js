// app.js — CARV Soul Scanner hybrid version + NFT Mint feature
const connectBtn = document.getElementById("connectWallet");
const scanBtn = document.getElementById("scanSoul");
const mintBtn = document.getElementById("mintNFT");
const walletInfo = document.getElementById("walletInfo");
const soulPoints = document.getElementById("soulPoints");
const insightEl = document.getElementById("insight");
const shareBtn = document.getElementById("shareX");
const mintStatus = document.getElementById("mintStatus");

let walletAddress = "";
let soulScore = 0;

// Randomized AI-style insights
const localInsights = [
  "Your data sparkles with rare potential — keep going.",
  "You’re building something the future will remember.",
  "The on-chain winds favor those who listen to their code.",
  "Your digital aura hums with creative energy.",
  "You are one commit away from greatness.",
  "The CARVverse feels your frequency rising.",
  "Your blockchain footprint whispers of legend.",
  "Sovereignty suits your soul — you were made for this."
];

// Connect wallet
connectBtn.addEventListener("click", async () => {
  try {
    if (window.backpack) {
      const response = await window.backpack.connect();
      walletAddress = response.publicKey.toString();
      walletInfo.innerText = `Wallet: ${shorten(walletAddress)}`;
    } else if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      walletAddress = accounts[0];
      walletInfo.innerText = `Wallet: ${shorten(walletAddress)}`;
    } else {
      walletInfo.innerText = "No wallet found.";
      alert("Install Backpack or MetaMask.");
      return;
    }
  } catch (err) {
    console.error(err);
    walletInfo.innerText = "Wallet connection failed.";
  }
});

// Soul Scan
scanBtn.addEventListener("click", async () => {
  if (!walletAddress) return alert("Connect wallet first!");
  soulScore = Math.floor(Math.random() * 1000) + 100;
  const randomInsight = localInsights[Math.floor(Math.random() * localInsights.length)];
  soulPoints.innerText = `🌟 Soul Points: ${soulScore}`;
  insightEl.innerText = `💫 Insight: ${randomInsight}`;
  mintBtn.style.display = "inline-block"; // show mint button after scan
});

// Mint NFT (demo simulation)
mintBtn.addEventListener("click", async () => {
  mintStatus.innerText = "⏳ Minting your Soul NFT...";
  mintBtn.disabled = true;

  try {
    // Simulate mint transaction
    await new Promise(res => setTimeout(res, 2000));

    // Here you’d integrate a real NFT minting smart contract
    // e.g., via ethers.js interacting with a deployed contract

    mintStatus.innerText = `✅ Soul NFT minted for ${shorten(walletAddress)} (${soulScore} pts)!`;
  } catch (err) {
    console.error(err);
    mintStatus.innerText = "❌ Minting failed.";
  }

  mintBtn.disabled = false;
});

// Share on X
shareBtn.addEventListener("click", () => {
  const tweetText = encodeURIComponent(
    `Just scanned my soul on CARV 🧠\nSoul Points: ${soulScore}\n${insightEl.innerText}\n\n@CashieCarv may reply with a deeper insight ✨`
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
  window.open(tweetUrl, "_blank");
});

// Helper: shorten wallet
function shorten(addr) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
}
