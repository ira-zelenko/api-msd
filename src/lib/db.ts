import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";

const envFile =
  process.env.NODE_ENV === "production" ? ".env" : ".env.local";

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const uri = process.env.MONGODB_URI as string;
const uriTest = process.env.MONGODB_URI_TEST as string;

if (!uri) throw new Error("MONGODB_URI is not defined");
if (!uriTest) throw new Error("MONGODB_URI_TEST is not defined");

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

let testClient: MongoClient;
let testClientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // Production database connection
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri);
    (global as any)._mongoClientPromise = client.connect();
  }

  clientPromise = (global as any)._mongoClientPromise;

  // Test database connection
  if (!(global as any)._mongoTestClientPromise) {
    testClient = new MongoClient(uriTest);
    (global as any)._mongoTestClientPromise = testClient.connect();
  }

  testClientPromise = (global as any)._mongoTestClientPromise;
} else {
  // Production database connection
  client = new MongoClient(uri);
  clientPromise = client.connect();

  // Test database connection
  testClient = new MongoClient(uriTest);
  testClientPromise = testClient.connect();
}

export default clientPromise;
export { testClientPromise };
