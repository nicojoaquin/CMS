import { auth } from "@/lib/auth/config";
import { toNodeHandler } from "better-auth/node";

export const config = { api: { bodyParser: false } };

export default toNodeHandler(auth.handler);
