import { betterAuth } from "better-auth";
import {mongodbAdapter} from "better-auth/adapters/mongodb";
import {connectToDatabase} from "@/database/mongoose";
import {nextCookies} from "better-auth/next-js";


let authInstance: ReturnType<typeof betterAuth> | null = null;

export const getAuth = async () => {
    if(authInstance) {
        return authInstance;
    }

    const mongoose = await connectToDatabase();

    // During build or when database is unavailable, return null
    if (!mongoose) {
        console.warn("Auth: Database not available, returning null auth instance");
        return null;
    }

    const db = mongoose.connection;

    if (!db) {
        throw new Error("MongoDB connection not found!");
    }

    authInstance = betterAuth({
        database: mongodbAdapter(db as any),
       secret: process.env.BETTER_AUTH_SECRET,
        baseURL: process.env.BETTER_AUTH_URL,
        emailAndPassword: {
            enabled: true,
            disableSignUp: false,
            requireEmailVerification: false,
            minPasswordLength: 8,
            maxPasswordLength: 128,
            autoSignIn: true,
        },
        plugins: [nextCookies()],

    });

    return authInstance;
}

// Proxy for lazy auth initialization
// Handles auth.api.getSession({...}) pattern
// @ts-expect-error - Proxy typing is complex
export const auth = new Proxy({}, {
    get(_, prop) {
        if (prop === 'then' || prop === 'toJSON') {
            return undefined;
        }

        return new Proxy({}, {
            get: (_, subProp) => {
                return async (...args: any[]) => {
                    const authInstance = await getAuth();
                    if (!authInstance) {
                        throw new Error("Auth not initialized - database may be unavailable");
                    }
                    // @ts-expect-error - dynamic property access
                    const value = authInstance[prop]?.[subProp];
                    if (typeof value === 'function') {
                        return value(...args);
                    }
                    return value;
                };
            }
        });
    }
});