import dotenv from 'dotenv';
dotenv.config();
import { OpenAI } from 'openai';

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Default prompt template for formatting query and document results
  const defaultPromptTemplate = `
You are a helpful and knowledgeable assistant. Answer the user's question based on the provided documents.
Use the information from the documents to provide a comprehensive and accurate response.
If the documents don't contain enough information to fully answer the question, acknowledge what you know
from the documents and what you don't know.

Documents:
\${documents}

User Question: \${query}

Your helpful answer:`;

  // Function to create a formatted prompt using a template
  function createPrompt(query: string, documents: string[], template: string = defaultPromptTemplate): string {
    const combinedDocs = documents.join('\n\n---\n\n');
    return template
      .replace('\${query}', query)
      .replace('\${documents}', combinedDocs);
  }

  async function generateResponse(query: string,
   documents: string[], promptTemplate?: string): Promise<string> {
    try {
      const formattedPrompt = createPrompt(query, documents, promptTemplate);

      const response = await
  openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that answers questions based on the provided context. If the context doesn't contain relevant information, say you don't know."
          },
          {
            role: "user",
            content: formattedPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0]?.message?.content || "I couldn't generate a response.";
    } catch (error) {
      console.error('OpenAI API error:', error);
      return "Sorry, I encountered an error processing your request.";
    }
  }

  export { generateResponse, createPrompt };