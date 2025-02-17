import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("[API] Received request at /api/ollama with method:", req.method);

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    console.log("[API] Method not allowed. Returning 405.");
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // Destructure the prompt and model from the request body.
  const { prompt, model } = req.body;
  console.log("[API] Request body:", req.body);

  if (process.env.USE_REAL_LLAMA_API === "true") {
    try {
      const dockerizedApiUrl =
        process.env.DOCKERIZED_API_URL || "http://localhost:11434/api/generate";
      console.log("[API] Using dockerized API URL:", dockerizedApiUrl);

      // Prepare the payload as required.
      const payload = {
        model: model || "qwen:0.5b",
        prompt: prompt,
      };
      console.log("[API] Payload to forward:", payload);

      // Make the POST request to the Ollama endpoint.
      const axiosResponse = await axios.post(dockerizedApiUrl, payload, {
        headers: { "Content-Type": "application/json" },
        responseType: "text",
      });
      console.log("[API] Axios response data:", axiosResponse.data);

      // Process the newline-delimited JSON response.
      const fullText: string = axiosResponse.data;
      const lines: string[] = fullText
        .split("\n")
        .filter((line: string) => line.trim().length > 0);
      console.log("[API] Parsed lines:", lines);

      let combinedResponse = "";
      for (const line of lines) {
        console.log("[API] Processing line:", line);
        try {
          const jsonLine = JSON.parse(line);
          combinedResponse += jsonLine.response;
        } catch (err) {
          console.log("[API] Error parsing JSON for line:", line, err);
        }
      }
      console.log("[API] Combined response:", combinedResponse);

      return res.status(200).json({ response: combinedResponse });
    } catch (error) {
      console.error("[API] Error in real API forwarding:", error);
      return res
        .status(500)
        .json({ message: "Error communicating with the model API" });
    }
  }

  // If not using the real API, return a fake response.
  try {
    console.log("[API] Using fake response");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const fakeOutput = `Fake response for prompt: "${prompt}"`;
    console.log("[API] Fake output:", fakeOutput);
    return res.status(200).json({ response: fakeOutput });
  } catch (error) {
    console.error("[API] Error processing fake response:", error);
    return res
      .status(500)
      .json({ message: "Error communicating with local LLM" });
  }
}
