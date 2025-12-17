import cors from "cors";
import "dotenv/config.js";
import express from "express";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/authRoutes.js";
import diaryRoutes from "./routes/diaryRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all origins
app.use(express.json({ limit: "50mb" }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

app.use("/api/auth", authRoutes);
app.use("/api/diaries", diaryRoutes);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on PORT ${PORT}`);
    console.log(`Accessible at: http://10.0.0.34:${PORT}`);
    connectDB();
})