import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.warn("MONGODB_URI environment variable is not set. MongoDB connection will be skipped.");
}

export const client = uri ? new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
}) : null;

export async function connectToMongoDB() {
  if (!client) {
    console.log("MongoDB client not configured (MONGODB_URI not set). Skipping connection.");
    return null;
  }
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    return client;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}
