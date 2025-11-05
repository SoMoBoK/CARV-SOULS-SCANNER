let walletAddress = null;
const carvApi = "https://api.carv.io/v1/user/profile/";

// Connect wallet logic
document.getElementById("connectWallet").addEventListener("click", async () => {
  if (window.backpack) {
    try {
      const response = await window.backpack.connect();
      walletAddress = response.publicKey || response.address;
      document.getElementById("walletAddress").innerText = `Wallet: ${walletAddress}`;
      alert("✅ Backpack Wallet Connected!");
    } catch {
      alert("Failed to connect Backpack wallet.");
    }
  } else if (window.ethereum) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      walletAddress = accounts[0];
      document.getElementById("walletAddress").innerText = `Wallet: ${walletAddress}`;
      alert("✅ MetaMask Connected!");
    } catch {
      alert("MetaMask connection failed.");
    }
  } else {
    alert("Please install Backpack or MetaMask wallet.");
  }
});

// Scan soul
document.getElementById("scanSoul").addEventListener("click", async () => {
  if (!walletAddress) {
    alert("Please connect your wallet first.");
    return;
  }

  const carvUid = document.getElementById("carvUid").value || "Not Provided";
  const report = document.getElementById("soulReport");
  const uidDisplay = document.getElementById("uidDisplay");
  const walletDisplay = document.getElementById("walletDisplay");
  const soulPoints = document.getElementById("soulPoints");
  const aiInsight = document.getElementById("aiInsight");

  walletDisplay.innerText = walletAddress;
  uidDisplay.innerText = carvUid;

  // Generate random soul points
  const points = Math.floor(Math.random() * 1000) + 1;
  soulPoints.innerText = `${points} pts`;

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Analyze this CARV soul data:\nWallet: ${walletAddress}\nPoints: ${points}\nUID: ${carvUid}`
      })
    });

    const data = await response.json();
    aiInsight.innerText = data.reply || "No insight generated.";
  } catch (e) {
    aiInsight.innerText = "AI failed to read your soul — try again ⚡";
  }

  report.classList.remove("hidden");
});

// Theme toggle
document.getElementById("toggleTheme").addEventListener("click", () => {
  const body = document.body;
  const isDark = body.classList.contains("bg-gray-900");
  if (isDark) {
    body.classList.remove("bg-gray-900", "text-white");
    body.classList.add("bg-gray-100", "text-gray-900");
  } else {
    body.classList.add("bg-gray-900", "text-white");
    body.classList.remove("bg-gray-100", "text-gray-900");
  }
});

// Share on X
document.getElementById("shareOnX").addEventListener("click", () => {
  const insight = document.getElementById("aiInsight").innerText;
  const points = document.getElementById("soulPoints").innerText;
  const text = encodeURIComponent(`Just scanned my soul on CARV 🧠\nSoul Points: ${points}\nInsight: ${insight}\n⚡ Powered by CARV × AI`);
  const url = `https://twitter.com/intent/tweet?text=${text}`;
  window.open(url, "_blank");
});
