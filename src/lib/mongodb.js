import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};
const globalCache = globalThis.__mongoClientCache || {};

async function connectToDatabase() {
  if (!uri) {
    console.error("Missing MONGODB_URI environment variable.");
    throw new Error("Please define MONGODB_URI in your environment.");
  }

  if (!globalCache.clientPromise) {
    const client = new MongoClient(uri, options);
    globalCache.clientPromise = client.connect();
  }

  globalThis.__mongoClientCache = globalCache;
  return globalCache.clientPromise;
}

export default connectToDatabase;
