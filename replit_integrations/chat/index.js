const { registerChatRoutes, getOpenAIClientExported } = require("./routes.js");
const { chatStorage } = require("./storage.js");
module.exports = { registerChatRoutes, getOpenAIClientExported, chatStorage };
