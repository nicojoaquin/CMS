import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getDb } from "../db/utils";

export const auth = betterAuth({
  database: mongodbAdapter(await getDb("blog-cms")),
  secret: process.env.BETTER_AUTH_SECRET!,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    requireEmailVerification: false,
  },
});

export const getServerSession = auth.api.getSession;
