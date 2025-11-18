// api/scan.js — Test-only D.A.T.A Framework validation
// CommonJS, matches original CARV SOUL SCANNER project style

const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // ----- parse body safely (Vercel CJS) -----
    let body = req.body;
    if (!body) {
      body = await new Promise((resolve) => {
        let data = "";
        req.on("data", (chunk) => (data += chunk));
        req.on("end", () => {
          try { resolve(JSON.parse(data)); }
          catch { resolve({}); }
        });
      });
    }

    const walletAddress = body.walletAddress;
    if (!walletAddress) {
      return res.status(400).json({ error: "Missing wallet address" });
    }

    const DATA_KEY = process.env.DATA_API_KEY || "";
    const DEBUG = process.env.DEBUG_MODE === "true";
    const DATA_BASE = "https://api.carv.io/v1";

    // ----- 1) USER ENDPOINT -----
    const userUrl = `${DATA_BASE}/user?wallet=${walletAddress}`;
    let userRes;
    try {
      userRes = await fetch(userUrl, {
        headers: {
          "x-api-key": DATA_KEY,
          "Accept": "application/json"
        }
      });
    } catch (err) {
      return res.status(502).json({
        error: "D.A.T.A user endpoint unreachable",
        details: err.message
      });
    }

    if (!userRes.ok) {
      return res.status(502).json({
        mode: "DATA_FRAMEWORK",
        ok: false,
        error: "D.A.T.A user endpoint failed",
        details: {
          status: userRes.status,
          statusText: userRes.statusText,
          endpoint: userUrl
        }
      });
    }

    const userJson = await userRes.json().catch(() => null);

    // ----- 2) CREDENTIALS ENDPOINT -----
    const credUrl = `${DATA_BASE}/credentials?wallet=${walletAddress}`;
    let creds = null;
    try {
      const credRes = await fetch(credUrl, {
        headers: {
          "x-api-key": DATA_KEY,
          "Accept": "application/json"
        }
      });
      if (credRes.ok) {
        creds = await credRes.json().catch(() => null);
      }
    } catch {
      creds = null;
    }

    // ----- SIMPLE TEST SCORING -----
    const achievementCount = Array.isArray(creds?.data) ? creds.data.length : 0;
    let score = 300 + (achievementCount * 6);
    if (score > 900) score = 900;
    if (score < 100) score = 100;

    const insights = [
      `Achievements: ${achievementCount}`,
      userJson?.data?.profile ? "Profile exists" : "No profile"
    ];

    return res.status(200).json({
      mode: "DATA_FRAMEWORK_TEST",
      ok: true,
      score,
      insights,
      raw: DEBUG ? { userJson, creds } : undefined
    });

  } catch (err) {
    return res.status(500).json({
      error: "Server crash",
      details: err.message
    });
  }
};
