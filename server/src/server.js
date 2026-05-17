import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase } from "./utils/db.js";

dotenv.config();

const port = process.env.PORT || 5000;

await connectDatabase();

app.listen(port, () => {
  console.log(`Goal Portal API running on http://localhost:${port}`);
});
