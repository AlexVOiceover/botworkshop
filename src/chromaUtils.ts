import { ChromaClient, Collection } from "chromadb";

// Initialize ChromaDB client
const client = new ChromaClient({
  path: 'http://localhost:8000'
});

// Get the knowledge collection
async function getKnowledgeCollection(): Promise<Collection> {
  return await client.getOrCreateCollection({
    name: "knowledge_collection",
  });
}

// Query the collection
async function queryKnowledge(queryText: string, numResults: number = 3): Promise<string[]> {
  try {
    const collection = await getKnowledgeCollection();
    const results = await collection.query({
      queryTexts: [queryText],
      nResults: numResults,
    });
    
    // Filter out null values and convert to string[]
    return (results.documents[0] || [])
      .filter((doc): doc is string => doc !== null);
  } catch (error) {
    console.error('Error querying ChromaDB:', error);
    return [];
  }
}

export { queryKnowledge };