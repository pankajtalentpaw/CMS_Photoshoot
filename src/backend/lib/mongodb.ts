import mongoose from "mongoose";
import { env } from "@/shared/config/env";
import dns from "dns";

// Force Google DNS for SRV resolution to bypass local network restrictions (ECONNREFUSED)
if (process.env.NODE_ENV === "development") {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
    console.log("ℹ️ [MongoDB] DNS servers set to Google Public DNS.");
  } catch (e) {
    console.warn("⚠️ [MongoDB] Failed to set custom DNS servers.");
  }
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseCache;
};

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

const cached = globalWithMongoose.mongoose;

const connectOptions: mongoose.ConnectOptions = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isServerSelectionTimeout(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const msg = error.message.toLowerCase();
  return (
    error.name === "MongoServerSelectionError" ||
    msg.includes("server selection timed out") ||
    msg.includes("whitelisted") ||
    msg.includes("querysrv") ||
    msg.includes("econnrefused")
  );
}

function buildDirectConnectionUris(uri: string): string[] {
  if (!uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://")) {
    return [];
  }

  const atIndex = uri.indexOf("@");
  const slashAfterAuth = uri.indexOf("/", atIndex + 1);
  if (atIndex === -1 || slashAfterAuth === -1) {
    return [];
  }

  const protocolAndAuth = uri.slice(0, atIndex + 1);
  const hosts = uri.slice(atIndex + 1, slashAfterAuth);
  const pathAndQuery = uri.slice(slashAfterAuth);
  const hostList = hosts.split(",").map((host) => host.trim()).filter(Boolean);

  const [path, rawQuery = ""] = pathAndQuery.split("?");
  const params = new URLSearchParams(rawQuery);

  params.delete("replicaSet");
  params.set("directConnection", "true");

  if (!params.has("tls") && !params.has("ssl")) {
    params.set("tls", "true");
  }

  return hostList.map((host) => `${protocolAndAuth}${host}${path}?${params.toString()}`);
}

function normalizeConnectionError(error: unknown): Error {
  if (error instanceof Error) {
    if (isServerSelectionTimeout(error)) {
      return new Error(
        "Database connection failed (DNS/SRV Error). If you are on a restricted network, please use the 'Standard Connection String' format from MongoDB Atlas (mongodb://...) instead of the SRV format.",
        { cause: error }
      );
    }

    return error;
  }

  return new Error("Database connection failed");
}

async function dbConnect() {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      const directUris = buildDirectConnectionUris(env.MONGODB_URI);

      try {
        const mongooseInstance = await mongoose.connect(env.MONGODB_URI, connectOptions);
        console.log("✅ [MongoDB] Connected to database.");
        return mongooseInstance;
      } catch (firstError) {
        console.warn("⚠️ [MongoDB] First connection attempt failed. Retrying once...");
        await wait(1000);

        try {
          const mongooseInstance = await mongoose.connect(env.MONGODB_URI, connectOptions);
          console.log("✅ [MongoDB] Connected to database on retry.");
          return mongooseInstance;
        } catch (secondError: any) {
          console.error("❌ [MongoDB] Connection failed:", secondError?.message || secondError);
          if (directUris.length > 0 && isServerSelectionTimeout(secondError ?? firstError)) {
            console.warn("⚠️ [MongoDB] Replica set discovery failed. Trying direct node fallback...");

            let lastFallbackError: unknown = secondError;
            for (const directUri of directUris) {
              try {
                const mongooseInstance = await mongoose.connect(directUri, connectOptions);
                const db = mongoose.connection.db;
                if (!db) {
                  throw new Error("MongoDB connection initialized without database handle");
                }

                const hello = await db.admin().command({ hello: 1 });
                const isWritablePrimary = Boolean(hello?.isWritablePrimary ?? hello?.ismaster);

                if (isWritablePrimary) {
                  console.log("✅ [MongoDB] Connected using direct writable primary fallback.");
                  return mongooseInstance;
                }

                await mongoose.disconnect();
                lastFallbackError = new Error("Connected node is not writable primary");
              } catch (fallbackError) {
                lastFallbackError = fallbackError;
                try {
                  await mongoose.disconnect();
                } catch {
                  // Ignore disconnect failures while probing fallback nodes.
                }
              }
            }

            throw normalizeConnectionError(lastFallbackError);
          }

          throw normalizeConnectionError(secondError ?? firstError);
        }
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
