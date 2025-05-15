import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { queryKnowledge } from './chromaUtils';

// Load environment variables
dotenv.config();

// Get bot token from environment variables
const token = process.env.TELEGRAM_API_TOKEN;

if (!token) {
  throw new Error('No TELEGRAM_API_TOKEN in .env file');
}

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

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

// Handle /knowledge command
bot.onText(/\/ai (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match ? match[1] : '';
  
  if (!query) {
    bot.sendMessage(chatId, 'Please provide a query after /knowledge');
    return;
  }
  
  try {
    // Indicate that we're processing
    bot.sendMessage(chatId, `Searching for: "${query}"...`);
    
    // Query ChromaDB
    const results = await queryKnowledge(query, 3);
    
    // Format and send results
    if (results.length > 0) {
      const responseText = results
        .map((doc, i) => `${i+1}. ${doc}`)
        .join('\n\n');
      
      bot.sendMessage(chatId, `Results for "${query}":\n\n${responseText}`);
    } else {
      bot.sendMessage(chatId, 'No results found.');
    }
  } catch (error) {
    console.error('Error:', error);
    bot.sendMessage(chatId, 'Error processing your request.');
  }
});

console.log('Bot is running...');