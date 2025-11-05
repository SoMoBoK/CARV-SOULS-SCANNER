export default async function handler(req, res) {
  try {
    const { wallet, score } = req.body;

    // prompt changes slightly for randomness
    const prompts = [
      `A crypto soul with score ${score}. What future lies ahead?`,
      `Wallet ${wallet} earned a soul score of ${score}. Give a motivational prophecy.`,
      `A web3 explorer scored ${score}. What destiny awaits in AI x Web3?`,
      `Soul score ${score}. Describe their strengths and future potential.`,
      `Score ${score} — give a futuristic AI-oracle insight.`
    ];

    const prompt = prompts[Math.floor(Math.random() * prompts.length)];

    const payload = {
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }]
    };

    const openai = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const result = await openai.json();
    res.status(200).json({
      insight: result.choices[0].message.content
    });

  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
}
