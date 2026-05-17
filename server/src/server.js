import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase, usingMemoryStore } from "./utils/db.js";
import { bootstrapAdmin } from "./utils/bootstrapAdmin.js";

dotenv.config();

const port = process.env.PORT || 5000;

await connectDatabase();
if (!usingMemoryStore) {
  await bootstrapAdmin();
}

app.listen(port, () => {
  console.log(`Goal Portal API running on http://localhost:${port}`);
});
