import { MongoClient, MongoClientOptions } from "mongodb";

if (!process.env.MONGO_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const uri = process.env.MONGO_URI;
// Add proper MongoDB connection options for better performance and reliability
const options: MongoClientOptions = {
  // Modern MongoDB driver settings for better performance
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  // The w: 'majority' setting ensures data is written to a majority of nodes
  // which is important for data durability
  w: "majority",
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// In development mode we use a global variable to preserve the value across
// module reloads caused by HMR (Hot Module Replacement)
if (process.env.NODE_ENV === "development") {
  // Use type assertion for globalThis
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production, use a regular approach without globals
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
