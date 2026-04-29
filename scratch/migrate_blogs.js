const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Import the Blog model
// Note: You might need to adjust the path based on your structure
const Blog = require("../src/models/admin_home/Blog");

async function migrate() {
  try {
    console.log("Connecting to MongoDB...");
    // Update the connection string if needed, or use the one from your app
    // For now I'll assume it's in process.env.MONGO_URI or similar
    // Actually, I'll try to find where the DB is initialized.
    
    await mongoose.connect("mongodb://localhost:27017/dlk_software_solution"); // Fallback or common default
    
    console.log("Connected. Migrating blogs...");
    
    const result = await Blog.updateMany(
      { isApproved: { $exists: false } },
      { $set: { isApproved: true } }
    );
    
    console.log(`Migration complete. Updated ${result.modifiedCount} blogs.`);
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
