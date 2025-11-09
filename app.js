// app.js — CARV Soul Scanner + Live NFT Mint (Base Sepolia)
const connectBtn = document.getElementById("connectWallet");
const scanBtn = document.getElementById("scanSoul");
const mintBtn = document.getElementById("mintNFT");
const walletInfo = document.getElementById("walletInfo");
const soulPoints = document.getElementById("soulPoints");
const insightEl = document.getElementById("insight");
const shareBtn = document.getElementById("shareX");
const mintStatus = document.getElementById("mintStatus");

let walletAddress = "";
let signer;
let soulScore = 0;

// Base Sepolia SoulNFT Contract
const CONTRACT_ADDRESS = "0xEE6f5a683e6FF5560D690421aa9e4fe27E738bD1";

// Minimal ABI for minting Soul NFTs (ERC721)
const ABI = [
  "function safeMint(address to, string memory uri) public",
];

// Randomized AI-style insights
const localInsights = [
  "Your data sparkles with rare potential — keep going.",
  "You’re building something the future will remember.",
  "The on-chain winds favor those who listen to their code.",
  "Your digital aura hums with creative energy.",
  "You are one commit away from greatness.",
  "The CARVverse feels your frequency rising.",
  "Your blockchain footprint whispers of legend.",
  "Sovereignty suits your soul — you were made for this.",
  "Your Soul shines to greatness.",
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
];

// Connect wallet (Backpack or MetaMask)
connectBtn.addEventListener("click", async () => {
  try {
    if (window.backpack) {
      const response = await window.backpack.connect();
      walletAddress = response.publicKey.toString();
      walletInfo.innerText = `Wallet: ${shorten(walletAddress)} (Backpack)`;
    } else if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      walletAddress = await signer.getAddress();
      walletInfo.innerText = `Wallet: ${shorten(walletAddress)} (MetaMask)`;
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
  mintBtn.style.display = "inline-block"; // show mint button
});

// Mint NFT on Base Sepolia
mintBtn.addEventListener("click", async () => {
  if (!signer) {
    alert("Please connect your wallet first.");
    return;
  }

  try {
    mintStatus.innerText = "⏳ Minting your Soul NFT on Base Sepolia...";
    mintBtn.disabled = true;

    // Contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    // Create dynamic metadata URI (you can host on IPFS or JSON later)
    const metadata = {
      name: `SoulNFT #${Math.floor(Math.random() * 9999)}`,
      description: `Soul Points: ${soulScore} — ${insightEl.innerText}`,
      attributes: [{ trait_type: "Soul Score", value: soulScore }],
    };

    const metadataURI = `data:application/json;base64,${btoa(unescape(encodeURIComponent(JSON.stringify(metadata))));

    // Send mint transaction
    const tx = await contract.safeMint(walletAddress, metadataURI);
    await tx.wait();

    mintStatus.innerText = `✅ Soul NFT minted successfully!\nTX: ${tx.hash}`;
  } catch (err) {
    console.error(err);
    mintStatus.innerText = "❌ Minting failed — check console or BaseScan.";
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
