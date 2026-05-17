import mongoose from "mongoose";

export let usingMemoryStore = false;

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    usingMemoryStore = true;
    console.log("MONGODB_URI not set. Running with in-memory demo data.");
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB Atlas");
}
