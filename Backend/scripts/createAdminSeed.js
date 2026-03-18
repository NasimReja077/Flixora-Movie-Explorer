import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../src/models/User.model.js";

// 🔥 Load env from root (IMPORTANT)
dotenv.config({ path: "../.env" });

const createAdmin = async () => {
  try {
    // ✅ Connect DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    const email = "admin@flixora.com";

    // ✅ Check existing admin
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("❌ Admin already exists");
      process.exit(1);
    }

    // ✅ Create admin
    const admin = await User.create({
      username: "Admin",
      email,
      password: "Admin@123456",
      role: "admin",
      isVerified: true,
    });

    console.log("\n🎉 Admin created successfully!");
    console.log("📧 Email:", admin.email);
    console.log("🔑 Password: Admin@123456");
    console.log("⚠️ Please change password after login!\n");

    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

createAdmin();