import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { db } from "../db/config";

const users = db.collection("users");

export function createMongoAdapter() {
  return {
    async createUser(user: any) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const result = await users.insertOne({
        email: user.email,
        password: hashedPassword,
        fullName: user.fullName,
        createdAt: new Date(),
      });

      return { id: result.insertedId.toString(), ...user };
    },
    async getUserByEmail(email: string) {
      return await users.findOne({ email });
    },
    async getUserById(id: string) {
      return await users.findOne({ _id: new ObjectId(id) });
    },
  };
}
