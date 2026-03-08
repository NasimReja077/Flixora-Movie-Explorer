import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// routes

// test route
app.get("/", (req, res) => {
  res.send("Flixora API running...");
});

export default app;