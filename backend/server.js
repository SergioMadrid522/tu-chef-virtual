/* libraries*/
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
/* routes */
import routes from "./routes/routes.js";
dotenv.config();
const app = express();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`\n[AuthServer] ${req.method} en ${req.originalUrl}`);
  req.model = model;
  next();
});
/* routes */
app.use("/api", routes);

const PORT = process.env.PORT || 3112;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running in http://localhost:${PORT}`);
});
