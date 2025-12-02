import express from "express";
import cors from "cors";
import "dotenv/config.js";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all origins
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
    console.log(`Accessible at: http://10.0.0.34:${PORT}`);
    connectDB();
})