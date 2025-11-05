import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const { prompt } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an AI oracle that reads souls and gives inspiring, varied insights." },
        { role: "user", content: prompt }
      ],
      max_tokens: 60,
      temperature: 0.9,
    });

    const reply = response.choices[0].message.content.trim();
    res.status(200).json({ reply });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({ reply: "AI failed to read your soul — try again ⚡" });
  }
}
