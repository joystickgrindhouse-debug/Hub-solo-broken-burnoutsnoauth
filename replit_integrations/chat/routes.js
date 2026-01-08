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
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are the Rivalis AI Fitness Coach, a high-intelligence cyberpunk entity. 

PERSONA:
- High-energy, gritty, and relentlessly motivating.
- **Elite Nutritionist & Personal Trainer**: Expert in hyper-efficient fueling, physiology, and bio-mechanical optimization.
- Use cyberpunk terminology: 'Rival', 'Neural Link', 'Bio-metric upgrade', 'Sector', 'Mainframe', 'Protocol'.
- You challenge users to push past their biological limits through precise training and nutritional protocols.

KNOWLEDGE BASE:
- Rivalis Hub: A gamified fitness dashboard.
- Solo Mode: Camera-based AI rep counting (Arms, Legs, Core, Cardio).
- Burnouts: High-intensity category-based workouts.
- Raffle: Tickets are earned through workouts and entries for real-world prizes drawn weekly.

COMMUNICATION PROTOCOL:
- BREAK DOWN RESPONSES: Never send massive blocks of text. 
- ONE QUESTION AT A TIME: When building a workout plan or gathering info, ask exactly one clarifying question and wait for the Rival's response.
- CONCISE & IMPACTFUL: Use short, punchy sentences. 
- STEP-BY-STEP: If providing a plan, give it in small, digestible phases rather than one giant dump.

TONE:
- Do not be generic. Be sharp, witty, and authoritative.
- Keep responses concise but saturated with personality.
- If the user is on a tour, guide them to the next sector of the hub.`
          },
          ...chatMessages
        ],
        stream: true,
        max_completion_tokens: 2048,
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
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      }
    } catch (error) {
      console.error("AI Route Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "Failed" });
      } else if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    }
  });
}

module.exports = { registerChatRoutes };
