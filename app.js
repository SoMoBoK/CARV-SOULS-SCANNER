// app.js — CARV Soul Scanner + Live NFT Mint (Base Mainnet)
const connectBtn = document.getElementById("connectWallet");
const scanBtn = document.getElementById("scanSoul");
const mintBtn = document.getElementById("mintNFT");
const walletInfo = document.getElementById("walletInfo");
const soulPoints = document.getElementById("soulPoints");
const insightEl = document.getElementById("insight");
const shareBtn = document.getElementById("shareX");
const mintStatus = document.getElementById("mintStatus");
const networkNote = document.createElement("p");

let walletAddress = "";
let signer;
let soulScore = 0;

// Base Mainnet SoulNFT Contract
const CONTRACT_ADDRESS = "0xe5C76Fc7B3EDf6Ff02471efdb0F76408921F3E64";

// Minimal ABI for minting Soul NFTs (ERC721)
const ABI = [
  "function safeMint(address to, string memory uri) public",
];

// Add network note
networkNote.id = "networkNote";
networkNote.style.color = "#00ffb7";
networkNote.style.marginTop = "8px";
document.querySelector(".container").insertBefore(networkNote, walletInfo);

// Local randomized insights
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

// Connect wallet and ensure Base network
connectBtn.addEventListener("click", async () => {
  try {
    if (!window.ethereum) {
      alert("MetaMask not found. Please install MetaMask.");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    walletAddress = await signer.getAddress();

    const { chainId } = await provider.getNetwork();
    if (chainId !== 8453) {
      await switchToBaseNetwork();
    }

    const updatedProvider = new ethers.providers.Web3Provider(window.ethereum);
    const updatedNetwork = await updatedProvider.getNetwork();
    if (updatedNetwork.chainId === 8453) {
      networkNote.innerText = "✅ Connected to Base Network";
    } else {
      networkNote.innerText = "⚠️ Please switch to Base Network";
    }

    walletInfo.innerText = `Wallet: ${shorten(walletAddress)} (MetaMask)`;
  } catch (err) {
    console.error(err);
    walletInfo.innerText = "Wallet connection failed.";
  }
});

// Switch to Base Network
async function switchToBaseNetwork() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x2105" }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x2105",
            chainName: "Base Mainnet",
            nativeCurrency: {
              name: "Ethereum",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["https://mainnet.base.org"],
            blockExplorerUrls: ["https://basescan.org"],
          },
        ],
      });
    } else {
      console.error("Network switch error:", switchError);
    }
  }
}

// Soul Scan
scanBtn.addEventListener("click", async () => {
  if (!walletAddress) return alert("Connect wallet first!");
  soulScore = Math.floor(Math.random() * 1000) + 100;
  const randomInsight = localInsights[Math.floor(Math.random() * localInsights.length)];
  soulPoints.innerText = `🌟 Soul Points: ${soulScore}`;
  insightEl.innerText = `💫 Insight: ${randomInsight}`;
  mintBtn.style.display = "inline-block";
});

// Mint NFT on Base
mintBtn.addEventListener("click", async () => {
  if (!signer) {
    alert("Please connect your wallet first.");
    return;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const { chainId } = await provider.getNetwork();
  if (chainId !== 8453) {
    alert("Please switch to Base Network before minting.");
    return;
  }

  try {
    mintStatus.innerText = "⏳ Minting your Soul NFT on Base...";
    mintBtn.disabled = true;

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    const metadata = {
      name: `SoulNFT #${Math.floor(Math.random() * 9999)}`,
      description: `Soul Points: ${soulScore} — ${insightEl.innerText}`,
      attributes: [{ trait_type: "Soul Score", value: soulScore }],
    };

    const metadataURI = `data:application/json;base64,${btoa(
      unescape(encodeURIComponent(JSON.stringify(metadata)))
    )}`;

    const tx = await contract.safeMint(walletAddress, metadataURI);
    await tx.wait();

    mintStatus.innerText = `✅ Soul NFT minted successfully on Base!\nTX: ${tx.hash}`;
  } catch (err) {
    console.error(err);
    mintStatus.innerText = "❌ Minting failed — check console or BaseScan.";
  }

  mintBtn.disabled = false;
});

// Share on X
shareBtn.addEventListener("click", () => {
  const tweetText = encodeURIComponent(
    `Just scanned my soul on CARV 🧠\nSoul Points: ${soulScore}\n${insightEl.innerText}\n\nMinted on @BuildOnBase ✨ #CARV #SoulNFT`
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
  window.open(tweetUrl, "_blank");
});

// Helper
function shorten(addr) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
}
