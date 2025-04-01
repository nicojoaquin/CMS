import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { betterAuth } from "better-auth";
import { db } from "../db/config";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    requireEmailVerification: false,
  },
});
