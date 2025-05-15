import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { queryKnowledge } from './chromaUtils';
import { generateResponse } from './openaiUtils';

// Load environment variables
dotenv.config();

// Get bot token from environment variables
const token = process.env.TELEGRAM_API_TOKEN;

if (!token) {
  throw new Error('No TELEGRAM_API_TOKEN in .env file');
}

// Custom prompt for RAG responses
const customRagPrompt = `
Use the retrieved documents to provide a comprehensive answer to the user's question.
If the documents provide sufficient information, craft a clear and concise response.
If the documents don't contain enough information to fully answer the question, acknowledge what you know
and what you don't know.

Documents:
\${documents}

User Question: \${query}

Please provide a helpful, accurate and concise answer:`;

// Create a bot instance
const bot = new TelegramBot(token, { polling: true })
bot.setMyCommands([
  { command: '/start', description: 'Start the bot' },
  { command: '/echo', description: 'Echo back your message' },
  { command: '/code', description: 'Get the repository URL' },
  { command: '/rag', description: 'Ask a question and get an answer' },]);

// Handle /echo command
bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const responseText = match ? match[1] : '';
  
  bot.sendMessage(chatId, responseText);
});

// Handle /code command
bot.onText(/\/code/, (msg) => {
  const chatId = msg.chat.id;
  const repoUrl = process.env.REPO_URL || 'Repository URL not found';
  
  bot.sendMessage(chatId, repoUrl);
});

// Handle /rag command
bot.onText(/\/rag (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match ? match[1] : '';
  
  if (!query) {
    bot.sendMessage(chatId, 'Please provide a query after /rag');
    return;
  }
  
  try {
    // Indicate that we're processing
    bot.sendMessage(chatId, `Searching for: "${query}"...`);
    
    // Query ChromaDB
    const results = await queryKnowledge(query, 3);
    
    // Format and send results
    if (results.length > 0) {
      // Then generate and send the AI response
      bot.sendMessage(chatId, 'Generating answer based on these documents...');
      
      // Use the custom prompt template for RAG
      const aiResponse = await generateResponse(query, results, customRagPrompt);
      bot.sendMessage(chatId, `${aiResponse}`);
    } else {
      bot.sendMessage(chatId, 'No relevant documents found to answer your question.');
    }
  } catch (error) {
    console.error('Error:', error);
    bot.sendMessage(chatId, 'Error processing your request.');
  }
});

console.log('Bot is running...');