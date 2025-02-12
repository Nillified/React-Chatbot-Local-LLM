import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { prompt } = req.body;

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
