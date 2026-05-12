const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Course = require("../src/models/admin_courses/Course");

const priceUpdates = [
  { duration: 3, price: 15000 },
  { duration: 6, price: 30000 },
  { duration: 9, price: 45000 },
  { duration: 12, price: 60000 }
];

async function updateCoursePrices() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    let totalUpdated = 0;

    for (const update of priceUpdates) {
      console.log(`Updating courses with ${update.duration} months duration to price ${update.price}...`);
      
      const result = await Course.updateMany(
        { duration_months: update.duration },
        { $set: { price: update.price } }
      );

      console.log(`   - Documents matched: ${result.matchedCount}`);
      console.log(`   - Documents modified: ${result.modifiedCount}`);
      
      totalUpdated += result.modifiedCount;
    }

    console.log(`\n✅ Migration complete. Total courses updated: ${totalUpdated}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error updating course prices:", err);
    process.exit(1);
  }
}

updateCoursePrices();
