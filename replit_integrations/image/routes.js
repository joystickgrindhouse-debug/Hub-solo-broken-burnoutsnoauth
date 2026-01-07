const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

function registerImageRoutes(app) {
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt } = req.body;
      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: "1024x1024",
      });
      res.json(response.data[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed" });
    }
  });
}
module.exports = { registerImageRoutes };
