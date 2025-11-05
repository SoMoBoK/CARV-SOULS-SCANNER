// Wallet connection: Try Backpack first, then MetaMask
async function connectWallet() {
  let wallet;

  if (window.backpack?.ethereum) {
    console.log("Backpack found");
    wallet = window.backpack.ethereum;
  } else if (window.ethereum) {
    console.log("MetaMask found");
    wallet = window.ethereum;
  } else {
    alert("Please install Backpack or MetaMask");
    return;
  }

  try {
    const accounts = await wallet.request({ method: "eth_requestAccounts" });
    const address = accounts[0];
    document.getElementById("walletAddress").innerText = "Wallet: " + address;
    window.userWallet = address;
  } catch {
    alert("Wallet connection failed");
  }
}

// Fake soul scoring (just demo math)
function generateSoulScore(wallet) {
  let hash = [...wallet].reduce((a, b) => a + b.charCodeAt(0), 0);
  return (hash % 100) + 1; // score 1-100
}

// Call OpenAI Insight API
async function scanSoul() {
  if (!window.userWallet) {
    alert("Connect wallet first");
    return;
  }

  const wallet = window.userWallet;
  const score = generateSoulScore(wallet);

  document.getElementById("score").innerText = "Soul Score: " + score;

  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet,
      score
    }),
  });

  const data = await res.json();
  document.getElementById("aiInsight").innerText = data.insight;
}
