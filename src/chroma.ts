import { ChromaClient } from "chromadb";

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

    // Add documents using upsert to avoid duplicates
    await collection.upsert({
      documents: [
        "bread is high in carbs",
        "meat is very low in carbs",
        "donuts are high in fat",
        "vegetables are low in fat",
        "fruit is high in sugar",
        "fish is high in protein",
        "chicken is low in sugar",
        "pasta is high in carbs",
        "rice is high in carbs",
        "potatoes are very high in carbs",
        "cheese is high in fat",
        "milk is high in protein",
        "yogurt is high in protein",
        "eggs are high in protein",
        "cars are fast",
        "bicycles are slow",
        "trains are fast",
        "planes are very fast",
        "boats are slow",
        "motorcycles are fast",
        "scooters are slow",
        "skateboards are slow"
      ],
      ids: ["doc1", "doc2", "doc3", "doc4", "doc5", "doc6", "doc7", "doc8", "doc9", "doc10", "doc11", "doc12", "doc13", "doc14", "doc15", "doc16", "doc17", "doc18", "doc19", "doc20", "doc21", "doc22"],
    });

    console.log('Added/updated documents in collection');

    // Query the collection
    const queryText = "I need a fast vehicle";
    console.log(`Querying: "${queryText}"`);
    
    const results = await collection.query({
      queryTexts: [queryText],
      nResults: 3,
    });

    // Display results
    console.log('\nResults:');
    if (results.documents[0]) {
      results.documents[0].forEach((doc, i) => {
        console.log(`${i+1}. ${doc}`);
      });
    } else {
      console.log('No results found');
    }

    // Count items in collection
    const count = await collection.count();
    console.log(`\nTotal documents in collection: ${count}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
runChroma();