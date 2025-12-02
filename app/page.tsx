
import { redis,db } from "@/lib/db-config/db";

export default async function Home() {
const res1=redis;
const res2=db;

console.log("db",res2)
console.log("redis",res1)

console.log("3kdnd")
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
    <h1>shayan</h1>
    </div>
  );
}