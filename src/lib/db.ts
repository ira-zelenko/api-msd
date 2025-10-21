import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";

const envFile =
  process.env.NODE_ENV === "production" ? ".env" : ".env.local";

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const uri = process.env.MONGODB_URI as string;

if (!uri) throw new Error("MONGODB_URI is not defined");

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
