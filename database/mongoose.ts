import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// FIX: Set Google DNS and force IPv4 to avoid querySrv ECONNREFUSED
import dns from 'dns';
try {
    // This is often more effective than setServers for Node 17+
    if (dns.setDefaultResultOrder) {
        dns.setDefaultResultOrder('ipv4first');
    }
    dns.setServers(['8.8.8.8']);
    console.log('MongoDB: Custom DNS settings applied');
} catch (e) {
    console.error('Failed to set custom DNS:', e);
}

declare global {
    var mongooseCache: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    }
}

let cached = global.mongooseCache;

if (!cached) {
    cached = global.mongooseCache = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
    if (!MONGODB_URI) {
        console.warn("MongoDB URI not configured - database connection skipped");
        return null;
    }

    // If already connected, return the cached connection
    if (cached.conn) return cached.conn;

    // If a connection attempt is already in progress, wait for it
    if (cached.promise) {
        try {
            cached.conn = await cached.promise;
            return cached.conn;
        } catch (err) {
            // Previous attempt failed, clear the promise so we can retry
            cached.promise = null;
            console.warn("Previous MongoDB connection failed, will retry on next request");
        }
    }

    // Try to connect
    try {
        cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false, family: 4 });
        cached.conn = await cached.promise;
        console.log(`MongoDB Connected ${MONGODB_URI} in ${process.env.NODE_ENV}`);
        return cached.conn;
    } catch (err) {
        // Connection failed - clear promise and return null
        // This allows the app to start even if MongoDB isn't available
        cached.promise = null;
        console.warn("MongoDB connection failed:", err instanceof Error ? err.message : "Unknown error");
        console.warn("Application will continue without database connection");
        return null;
    }
}