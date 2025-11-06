// api/ask.js
// Hybrid serverless handler: try OpenAI (if KEY present), otherwise return local randomized insight.
// Returns: { insight: string, fallback: boolean }

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { carvUid, walletAddress, soulScore } = req.body || {};
    const score = soulScore ?? Math.floor(Math.random() * 1000) + 1;

    const LOCAL = [
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
      "You are a careful alchemist — you turn tiny inputs into rare outputs."
    ];

    // helper personalize
    function personalize(t) {
      return t.replace("{score}", String(score)).replace("{uid}", carvUid || "unknown");
    }

    // If OPENAI_API_KEY present, try OpenAI first (but tolerate errors)
    const KEY = process.env.OPENAI_API_KEY;
    if (KEY) {
      try {
        const prompt = `
You are CARV Oracle. Given:
- CARV UID: ${carvUid || "N/A"}
- Wallet: ${walletAddress || "N/A"}
- Soul Points: ${score}

Create a short, unique, 1-2 sentence inspirational AI insight for this user. Vary tone and wording every time.
`.trim();

        const openRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${KEY}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 120,
            temperature: 0.9
          })
        });

        if (openRes.ok) {
          const j = await openRes.json();
          const text = j?.choices?.[0]?.message?.content?.trim();
          if (text) return res.status(200).json({ insight: text, fallback: false });
        } else {
          const errtxt = await openRes.text().catch(() => "");
          console.warn("OpenAI returned non-ok:", openRes.status, errtxt);
          // fall through to local
        }
      } catch (err) {
        console.warn("OpenAI call failed, falling back:", err?.message || err);
        // fall through to local
      }
    }

    // Local fallback
    const t = LOCAL[Math.floor(Math.random() * LOCAL.length)];
    const final = personalize(t);
    return res.status(200).json({ insight: final + (Math.random() < 0.35 ? ` (Score: ${score})` : ""), fallback: true });

  } catch (err) {
    console.error("api/ask error:", err);
    return res.status(200).json({ insight: "Your soul hums with potential — try again soon.", fallback: true });
  }
}
