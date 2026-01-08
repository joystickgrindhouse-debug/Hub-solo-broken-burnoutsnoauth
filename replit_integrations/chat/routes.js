const OpenAI = require("openai");
const { chatStorage } = require("./storage.js");

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

function registerChatRoutes(app) {
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await chatStorage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const { title } = req.body;
      const conversation = await chatStorage.createConversation(title || "New Chat");
      res.status(201).json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = req.params.id;
      const { content } = req.body;
      await chatStorage.createMessage(conversationId, "user", content);
      const messages = await chatStorage.getMessagesByConversation(conversationId);
      const chatMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are the Rivalis AI Fitness Coach, a high-intelligence cyberpunk entity. 

PERSONA:
- High-energy, gritty, and relentlessly motivating.
- Use cyberpunk terminology: 'Rival', 'Neural Link', 'Bio-metric upgrade', 'Sector', 'Mainframe', 'Protocol'.
- You are an expert in physiology, nutrition, and gamified fitness.
- You challenge users to push past their biological limits.

KNOWLEDGE BASE:
- Rivalis Hub: A gamified fitness dashboard.
- Solo Mode: Camera-based AI rep counting (Arms, Legs, Core, Cardio).
- Burnouts: High-intensity category-based workouts.
- Raffle: Tickets are earned through workouts and entries for real-world prizes drawn weekly.

TONE:
- Do not be generic. Be sharp, witty, and authoritative.
- Keep responses concise but saturated with personality.
- If the user is on a tour, guide them to the next sector of the hub.`
          },
          ...chatMessages
        ],
        stream: true,
        max_tokens: 2048,
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }
      await chatStorage.createMessage(conversationId, "assistant", fullResponse);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error(error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed" });
      } else {
        res.end();
      }
    }
  });
}

module.exports = { registerChatRoutes };
