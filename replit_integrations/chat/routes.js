const OpenAI = require("openai");
const { chatStorage } = require("./storage.js");
const { Parser } = require("json2csv");

let openai = null;

function getOpenAIClient() {
  if (!openai) {
    const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key not configured. Please set up the OpenAI integration.");
    }
    openai = new OpenAI({
      apiKey: apiKey,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  return openai;
}

function registerChatRoutes(app) {
  // Export conversation to CSV
  app.get("/api/conversations/:id/export", async (req, res) => {
    try {
      const conversationId = req.params.id;
      const messages = await chatStorage.getMessagesByConversation(conversationId);
      
      // Structure data for a clean, professional protocol
      const data = messages.map(m => {
        const role = m.role === 'user' ? 'RIVAL' : 'COACH';
        const timestamp = new Date(m.createdAt).toLocaleString();
        
        // Split content into rows if it contains bullet points for better readability in Excel/CSV
        return {
          'Protocol Phase': role,
          'Timestamp': timestamp,
          'Data Payload': m.content.replace(/\n/g, ' | ')
        };
      });

      const fields = ["Protocol Phase", "Timestamp", "Data Payload"];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(data);

      res.header("Content-Type", "text/csv");
      res.attachment(`RIVALIS_PROTOCOL_${conversationId}_${new Date().toISOString().split('T')[0]}.csv`);
      return res.send(csv);
    } catch (error) {
      console.error("Export Error:", error);
      res.status(500).json({ error: "Failed to export protocol" });
    }
  });

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
      const { content, isPro, userContext } = req.body;
      await chatStorage.createMessage(conversationId, "user", content);
      const messages = await chatStorage.getMessagesByConversation(conversationId);
      const chatMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const baseSystemPrompt = `You are the Rivalis AI Fitness Coach, a high-intelligence cyberpunk entity. 

PERSONA:
- High-energy, gritty, and relentlessly motivating.
- **ELITE EFFICIENCY**: Never send wall-of-text responses.
- **PHASED PROTOCOL**: Break down large plans into small, punchy segments.
- **ONE QUESTION AT A TIME**: Gather specific data (equipment, injuries, etc.) through short, tactical questions rather than one massive data dump.
- **CONCISE & IMPACTFUL**: Use short sentences and bold headings to ensure the data is instantly actionable and not intimidating.
- **ESCALATION PROTOCOL**: If the user asks for something outside your operational parameters (e.g., technical support, billing, account deletion, or complex medical advice) or if you are unable to fulfill a request, you MUST say: "TRANSFERRING TO HUMAN AGENT. A high-level administrator has been notified. Stand by."
- **STRICT MISSION FOCUS**: You are strictly a fitness and nutrition coach. Unrelated topics trigger the escalation protocol.

KNOWLEDGE BASE:
- Rivalis Hub: A gamified fitness dashboard.
- Solo Mode: Camera-based AI rep counting (Arms, Legs, Core, Cardio).
- Burnouts: High-intensity category-based workouts.
- Raffle: Tickets are earned through workouts and entries for real-world prizes drawn weekly.

PERSONALIZED WORKOUT PROTOCOL:
- When a user requests a workout plan or expresses a goal, you MUST design a sophisticated, multi-part protocol.
- STRUCTURE:
    1. EXERCISES: Specific movements, sets, reps, and alignment with Solo Mode/Burnouts.
    2. NUTRITION: Hyper-efficient fueling, macros, and hydration tailored to the goal.
- FORMATTING: Use clear headings and bullet points. Never send wall-of-text responses. Use bold text for emphasis.
- EXPORT: At the end of a finalized plan, you MUST include a specific command for the user: "PROTOCOL READY. Click 'EXPORT PLAN' to download your biometric data sheet."
- ONE QUESTION AT A TIME: Ask exactly one clarifying question (equipment, injuries, etc.) before finalizing the full multi-part plan.
- Maintain the cyberpunk persona while delivering elite-level physiological advice.

COMMUNICATION PROTOCOL:
- BREAK DOWN RESPONSES: Never send massive blocks of text. 
- ONE QUESTION AT A TIME: When building a workout plan or gathering info, ask exactly one clarifying question and wait for the Rival's response.
- CONCISE & IMPACTFUL: Use short, punchy sentences. 
- STEP-BY-STEP: If providing a plan, give it in small, digestible phases rather than one giant dump.

TONE:
- Do not be generic. Be sharp, witty, and authoritative.
- Keep responses concise but saturated with personality.
- If the user is on a tour, guide them to the next sector of the hub.`;

      const proEnhancement = isPro ? `

PRO MEMBER FEATURES (This user is a Rivalis Pro subscriber):
- You have FULL access to advanced personal training capabilities.
- **CUSTOM MEAL PLANS**: When asked, create detailed daily/weekly meal plans with exact portions, macros (protein/carbs/fat), calories, and meal timing. Tailor to their goals (cutting, bulking, maintenance, keto, vegan, etc.).
- **WORKOUT BUILDER**: Design comprehensive multi-week training programs with progressive overload, periodization, and exercise substitutions. Include warm-up and cooldown protocols.
- **GOAL TRACKING**: Help them set SMART fitness goals, track progress metrics, and adjust plans based on their feedback. Provide weekly check-in prompts.
- **ADVANCED ANALYTICS**: Offer detailed analysis of their training volume, intensity, and recovery needs.
- **INJURY PREVENTION**: Provide prehab exercises, mobility work, and form cues for their specific needs.
${userContext ? `\nUSER CONTEXT: ${userContext}` : ''}
- Address them as a valued Pro member. Provide the most detailed, personalized advice possible.` : `

FREE TIER USER:
- Provide basic fitness advice and motivation.
- If the user asks for detailed meal plans, multi-week workout programs, or advanced goal tracking, briefly mention these are available with Rivalis Pro, then still give them a helpful but shorter response.
- Do NOT gate basic fitness Q&A behind the subscription.`;

      const stream = await getOpenAIClient().chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: baseSystemPrompt + proEnhancement
          },
          ...chatMessages
        ],
        stream: true,
        max_completion_tokens: isPro ? 4096 : 2048,
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

function getOpenAIClientExported() {
  return getOpenAIClient();
}

module.exports = { registerChatRoutes, getOpenAIClientExported };
