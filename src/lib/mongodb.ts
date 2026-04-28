import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (uri && !global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise as Promise<MongoClient>;
} else if (uri) {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb() {
  if (!uri || !clientPromise) {
    throw new Error('MONGODB_URI is required');
  }

  const connectedClient = await clientPromise;
  return connectedClient.db(process.env.MONGODB_DB || 'jisort_dishi');
}
