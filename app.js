// app.js — CARV Soul Scanner + Live NFT Mint (Base Mainnet)
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

// ✅ Base Mainnet SoulNFT Contract
const CONTRACT_ADDRESS = "0xe5C76Fc7B3EDf6Ff02471efdb0F76408921F3E64";

// ✅ ABI for CARV SoulNFT (mintSoul)
const ABI = [
  "function mintSoul(address recipient, uint256 score, string memory insight) public returns (uint256)",
];

// Local randomized insights
const localInsights = [
  "Your data sparkles with rare potential — keep going.",
  "You’re building something the future will remember.",
  "Your digital aura hums with creative energy.",
  "A data storm brews… and you’re at its calm center.",
  "Your blockchain footprint whispers of legend.",
  "Your soul emits a strong decentralization signal.",
  "Sovereignty suits your soul — you were made for this.",
  "The CARVverse feels your frequency rising.",
  "Each scan refines your digital being.",
  "There’s light in your ledger."
];

// ✅ Helper: shorten wallet
function shorten(addr) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
}

// ✅ Helper: switch to Base mainnet if needed
async function ensureBaseNetwork(provider) {
  const baseChainId = "0x2105"; // 8453 in hex (Base mainnet)
  const network = await provider.getNetwork();

  if (network.chainId !== 8453) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: baseChainId }],
      });
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        // Not added yet, try adding Base network
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: baseChainId,
            chainName: "Base Mainnet",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://mainnet.base.org"],
            blockExplorerUrls: ["https://basescan.org/"],
          }],
        });
        return true;
      } else {
        alert("Please switch your network to Base Mainnet in MetaMask.");
        throw switchError;
      }
    }
  }
  return true;
}

// ✅ Connect Wallet
connectBtn.addEventListener("click", async () => {
  try {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      await ensureBaseNetwork(provider);
      signer = provider.getSigner();
      walletAddress = await signer.getAddress();
      walletInfo.innerText = `Wallet: ${shorten(walletAddress)} (MetaMask / Base)`;
    } else {
      walletInfo.innerText = "No wallet found.";
      alert("Install MetaMask.");
      return;
    }
  } catch (err) {
    console.error(err);
    walletInfo.innerText = "Wallet connection failed.";
  }
});

// ✅ Soul Scan
scanBtn.addEventListener("click", async () => {
  if (!walletAddress) return alert("Connect wallet first!");
  soulScore = Math.floor(Math.random() * 1000) + 100;
  const randomInsight = localInsights[Math.floor(Math.random() * localInsights.length)];
  soulPoints.innerText = `🌟 Soul Points: ${soulScore}`;
  insightEl.innerText = `💫 Insight: ${randomInsight}`;
  mintBtn.style.display = "inline-block"; // show mint button
});

// ✅ Mint NFT on Base
mintBtn.addEventListener("click", async () => {
  if (!signer) {
    alert("Please connect your wallet first.");
    return;
  }

  try {
    mintStatus.innerText = "⏳ Minting your Soul NFT on Base Mainnet...";
    mintBtn.disabled = true;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await ensureBaseNetwork(provider);

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const insightText = insightEl.innerText.replace("💫 Insight: ", "");

    // Call the actual contract mint function
    const tx = await contract.mintSoul(walletAddress, soulScore, insightText);
    await tx.wait();

    mintStatus.innerText = `✅ Soul NFT minted successfully on Base!\nTX: ${tx.hash}`;
  } catch (err) {
    console.error(err);
    mintStatus.innerText = "❌ Minting failed — check console or BaseScan.";
  }

  mintBtn.disabled = false;
});

// ✅ Share on X
shareBtn.addEventListener("click", () => {
  const tweetText = encodeURIComponent(
    `Just scanned my soul on CARV 🧠\nSoul Points: ${soulScore}\n${insightEl.innerText}\n\n@CashieCarv may reply with a deeper insight ✨ #Base #CARV`
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
  window.open(tweetUrl, "_blank");
});
