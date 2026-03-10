// dotenv.config();
import 'dotenv/config'; 
// import dotenv from "dotenv";
import app from "./app.js";
import connectDatabase from "./config/database.js";
import "./config/redis.config.js";


// Connect to database
connectDatabase();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode || Port: ${PORT}`);
});
