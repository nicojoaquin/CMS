import { createMongoAdapter } from "./mongo-adapter";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  adapter: createMongoAdapter(),
  emailAndPassword: {
    enabled: true,
  },
});
