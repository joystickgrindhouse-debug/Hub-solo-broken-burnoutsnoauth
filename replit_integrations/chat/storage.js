let conversations = {};
let messages = {};

const chatStorage = {
  async getConversation(id) {
    return conversations[id] || null;
  },
  async getAllConversations() {
    return Object.values(conversations);
  },
  async createConversation(title) {
    const id = Date.now().toString();
    conversations[id] = { id, title, createdAt: new Date() };
    return conversations[id];
  },
  async deleteConversation(id) {
    delete conversations[id];
    delete messages[id];
  },
  async getMessagesByConversation(conversationId) {
    return messages[conversationId] || [];
  },
  async createMessage(conversationId, role, content) {
    if (!messages[conversationId]) messages[conversationId] = [];
    const msg = { id: Date.now().toString(), role, content, createdAt: new Date() };
    messages[conversationId].push(msg);
    return msg;
  }
};

module.exports = { chatStorage };
