let walletAddress = null;
let soulPoints = null;
let insight = null;

document.getElementById("connectWallet").addEventListener("click", async () => {
  try {
    // Simulated wallet connection
    walletAddress = "E4HsDYuBfnaASS6692YVBvZYH5jmMucM1rN8pF8f1veM"; // Example only
    document.getElementById("walletDisplay").textContent = `Backpack: ${maskWallet(walletAddress)}`;
  } catch (err) {
    console.error("Wallet connection failed", err);
  }
});

document.getElementById("scanSoul").addEventListener("click", async () => {
  if (!walletAddress) {
    alert("Please connect your wallet first!");
    return;
  }

  const carvUID = document.getElementById("carvUID").value.trim();
  document.getElementById("soulReport").innerHTML = "🔮 Scanning your Soul...";

  try {
    // Simulate points (or integrate CARV API later)
    soulPoints = Math.floor(Math.random() * 1200) + 100;

    // Random insight
    const insights = [
      "The CARVverse feels your frequency rising.",
      "Your data aura glows brighter with every scan.",
      "The network whispers your digital essence.",
      "AI senses harmony between your soul and chain.",
      "You’re resonating with on-chain consciousness."
    ];
    insight = insights[Math.floor(Math.random() * insights.length)];

    // Update results
    document.getElementById("soulReport").innerHTML = `
      <p><strong>🌌 Soul Points:</strong> ${soulPoints} pts</p>
      <p>💡 <em>Insight:</em> ${insight}</p>
    `;
  } catch (err) {
    document.getElementById("soulReport").textContent = "⚠️ Failed to scan soul.";
    console.error(err);
  }
});

document.getElementById("shareButton").addEventListener("click", () => {
  const shareText = encodeURIComponent(
    `Just scanned my soul on CARV 🧠\n` +
    `Soul Points: ${soulPoints} pts\n` +
    `Insight: ${insight}\n` +
    `⚡ Backpack: ${maskWallet(walletAddress)}\n\n` +
    `Share on X and @CashieCarv may reply with a deeper public insight!`
  );

  const shareUrl = `https://twitter.com/intent/tweet?text=${shareText}`;
  window.open(shareUrl, "_blank");
});

function maskWallet(address) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
