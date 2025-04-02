import clientPromise from "@/lib/db/config";

export async function getDb(name: string) {
  return clientPromise.then((client) => client.db(name));
}
