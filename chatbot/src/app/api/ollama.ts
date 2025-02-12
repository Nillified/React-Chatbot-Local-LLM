// pages/api/ollama.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // Destructure additional fields if needed.
  const { prompt, contextPrompt, model } = req.body;

  // If USE_REAL_LLAMA_API is set to "true", call the real Llama API.
  if (process.env.USE_REAL_LLAMA_API === "true") {
    try {
      const llamaResponse = await axios.post(
        process.env.LLAMA_API_URL!, // e.g., "https://your-llama-api.com/endpoint"
        {
          prompt,
          contextPrompt,
          model,
        },
        {
          headers: {
            "Authorization": `Bearer ${process.env.LLAMA_API_KEY}`, // Ensure you have this key in your env
            "Content-Type": "application/json",
          },
        }
      );

      return res.status(200).json({ response: llamaResponse.data.response });
    } catch (error) {
      console.error("Error calling Llama API:", error);
      return res.status(500).json({ message: "Error communicating with Llama API" });
    }
  }

  // Otherwise, use the fake response for now.
  try {
    // Simulate processing delay (e.g., waiting for a model to process)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return fake response data (this is where your local LLM logic would eventually go)
    const fakeOutput = `Fake response for prompt: "${prompt}"`;

    return res.status(200).json({ response: fakeOutput });
  } catch (error) {
    console.error("Error processing fake LLM response:", error);
    return res.status(500).json({ message: "Error communicating with local LLM" });
  }
}
