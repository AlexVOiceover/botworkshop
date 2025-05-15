import { ChromaClient } from "chromadb";
import fs from 'fs';
import path from 'path';

async function runChroma() {
  try {
    // Initialize ChromaDB client (connect to Docker container)
    const client = new ChromaClient({
      path: 'http://localhost:8000'
    });

    console.log('Connected to ChromaDB');

    // Get or create a collection (using getOrCreateCollection to avoid duplicates)
    const collection = await client.getOrCreateCollection({
      name: "knowledge_collection",
    });

    console.log('Collection ready: knowledge_collection');
    
    // Clear existing documents before adding new ones
    console.log('Clearing existing documents...');
    try {
      await collection.delete({});
      console.log('All documents deleted');
    } catch (error) {
      console.log('No documents to delete or error deleting documents');
    }

    // Define the document interface
    interface DocumentData {
      id: string;
      text: string;
    }

    // Read the documents from data.json
    console.log('Reading documents from data.json...');
    const dataPath = path.resolve(__dirname, '../data/data.json');
    
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const jsonData = JSON.parse(rawData);
    
    if (!jsonData.documents || !Array.isArray(jsonData.documents)) {
      throw new Error('Invalid data format in data.json. Expected "documents" array.');
    }
    
    // Prepare documents and ids for upsert
    const documents = jsonData.documents.map((doc: DocumentData) => doc.text);
    const ids = jsonData.documents.map((doc: DocumentData) => doc.id);
    
    console.log(`Loaded ${documents.length} documents from data.json`);

    // Add documents using upsert to avoid duplicates
    await collection.upsert({
      documents,
      ids,
    });

    console.log('Added/updated documents in collection');

    // Count items in collection
    const count = await collection.count();
    console.log(`\nTotal documents in collection: ${count}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
runChroma();