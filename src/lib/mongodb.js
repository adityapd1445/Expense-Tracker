import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let clientPromise;

function createClientPromise() {
  if (!clientPromise) {
    const client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export default createClientPromise;
