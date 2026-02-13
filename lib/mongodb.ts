import mongoose from 'mongoose';

/**
 * Global type declaration for caching the mongoose connection
 * This ensures TypeScript recognizes the cached connection on the global object
 */
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

/**
 * MongoDB connection URI from environment variables
 */
const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global cache to store the mongoose connection
 * Prevents multiple connections in development due to hot reloading
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Establishes a connection to MongoDB using Mongoose
 * 
 * Features:
 * - Caches the connection to prevent multiple instances
 * - Reuses existing connections when available
 * - Optimized for serverless environments (Next.js)
 * 
 * @returns {Promise<mongoose.Connection>} The active MongoDB connection
 */
async function connectDB(): Promise<mongoose.Connection> {
  // Return cached connection if it exists
  if (cached.conn) {
    return cached.conn;
  }

  // Create a new connection if no promise exists
  if (!cached.promise) {
        
    if (!MONGODB_URI) {
        throw new Error(
            'Please define the MONGODB_URI environment variable inside .env.local'
        );
    }
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false, // Disable buffering for better error handling
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongooseInstance) => {
      return mongooseInstance.connection;
    });
  }

  try {
    // Wait for the connection to establish and cache it
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset the promise on error to allow retry
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
