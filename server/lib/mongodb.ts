import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = "mongodb+srv://saadbintofayel:Saad1234@chandrabati.byubzpi.mongodb.net/?appName=Chandrabati";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export async function connectToMongoDB() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    return client;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

// Note: In a real production app, you might want to handle disconnection or use a singleton pattern.
// For this setup, we're providing the connection logic as requested.
