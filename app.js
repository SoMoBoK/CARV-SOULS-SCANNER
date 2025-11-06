// api/ask.js
// Fallback-first production-ready handler:
//  - tries OpenAI if OPENAI_API_KEY present
//  - on any error (rate limit, missing key, etc.) returns a randomized local insight
//
// Returns JSON: { insight: "...", fallback: true|false }

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { carvUid, walletAddress, soulScore } = req.body || {};
    const score = soulScore ?? Math.floor(Math.random() * 1000) + 1;

    // ---- Local pool of varied insights (large and creative) ----
    const localTemplates = [
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
      "Your curiosity is a compass; follow it into useful experimentation.",
      "You pair grit with good taste — many will copy what you build next.",
      "You carry the quiet confidence of someone who knows how to finish things.",
      "A resilient mindset gives you rare optionality — play the long game.",
      "You turn constraints into creativity — an underrated superpower.",
      "Your wallet behavior reads like a student of compound interest — keep going.",
      "You have an explorer’s map and a builder’s toolkit — use both.",
      "Your digital footprint suggests an emerging leader — step up.",
      "You’re the kind of user who makes communities stronger by showing up.",
      "Your pattern: small experiments, quick learnings — that's the multiplier.",
      "Your intuition finds product-market fit before analytics catch up.",
      "You have a builder’s humility — it keeps you learning and shipping.",
      "You design small rituals that compound — that’s your hidden leverage.",
      "Your next micro-risk could become your macro advantage. Consider it.",
      "A sense of craft shows in your choices — that builds loyalty.",
      "You are mid-journey toward mastery — the next chapter looks promising.",
      "You speak in code and action — both are being noticed quietly.",
      "Your attention to fundamentals is a moat — protect and expand it.",
      "You combine curiosity with care; that balances speed and endurance.",
      "The chain is a mirror — what you put in, the network reflects back.",
      "Your pattern is helpful: you experiment, document, and share — a teacher-builder.",
      "You flex both imagination and discipline — the rare combo of creators."
    ];

    // Utility: fill template (if needed) with small personalization
    function personalize(template) {
      let t = template;
      if (t.includes("{score}")) t = t.replaceAll("{score}", String(score));
      if (t.includes("{uid}")) t = t.replaceAll("{uid}", carvUid || "unknown");
      if (t.includes("{wallet}")) t = t.replaceAll("{wallet}", (walletAddress || "wallet").toString());
      return t;
    }

    // Try OpenAI if key exists
    const OPENAI_KEY = process.env.OPENAI_API_KEY;

    if (OPENAI_KEY) {
      try {
        // call OpenAI REST API directly with fetch (no package dependence)
        const prompt = `
You are the CARV Oracle. Given the metadata below, produce a short 1-2 sentence inspirational AI insight.
User data:
- CARV UID: ${carvUid || "Not provided"}
- Wallet: ${walletAddress || "Not provided"}
- Soul Points: ${score}

Make it creative, varied, and not repetitive. Keep it short (max 2 sentences).
        `.trim();

        const openRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo", // safe, commonly available; change to a different model if you prefer
            messages: [{ role: "user", content: prompt }],
            temperature: 0.9,
            max_tokens: 120
          }),
          timeout: 30_000
        });

        if (!openRes.ok) {
          // log status and fallback to local templates
          const txt = await openRes.text().catch(() => "");
          console.error("OpenAI API error:", openRes.status, txt);
          throw new Error("OpenAI call failed");
        }

        const openJson = await openRes.json();
        const aiText = openJson?.choices?.[0]?.message?.content?.trim();

        if (aiText) {
          return res.status(200).json({ insight: aiText, fallback: false });
        } else {
          // no useful reply, fallback
          throw new Error("No text from OpenAI");
        }
      } catch (openErr) {
        console.warn("OpenAI attempt failed, using local fallback. Reason:", openErr?.message || openErr);
        // continue to fallback
      }
    }

    // ---- Local randomized fallback ----
    // pick a template and sometimes insert the score/uid
    const idx = Math.floor(Math.random() * localTemplates.length);
    let chosen = localTemplates[idx];

    // small chance to insert score or uid into message for variety
    if (Math.random() < 0.45) {
      chosen = `${chosen} (Score: ${score})`;
    }
    if (Math.random() < 0.12 && carvUid) {
      chosen = `${chosen} — ${carvUid}`;
    }

    const final = personalize(chosen);

    return res.status(200).json({ insight: final, fallback: true });
  } catch (err) {
    console.error("Unexpected /api/ask error:", err);
    // ultimate fallback very short
    return res.status(200).json({ insight: "Your soul hums with potential — try again soon.", fallback: true });
  }
}
