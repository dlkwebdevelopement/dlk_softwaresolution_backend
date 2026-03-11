const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");

// Models
const Navbar = require("../src/models/admin_home/Navbar");
const Blog = require("../src/models/admin_home/Blog");
const Testimonial = require("../src/models/admin_home/Testimonials");
const Company = require("../src/models/admin_home/Company");
const Banner = require("../src/models/admin_home/Banner");
const Course = require("../src/models/admin_courses/Course");

const LIVE_BASE_URL = "https://dlksoftwaresolutions.co.in";

const migrate = async () => {
  try {
    console.log("🚀 Starting Database Migration...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const modelsToUpdate = [
      { model: Navbar, field: "image" },
      { model: Blog, field: "image" },
      { model: Testimonial, field: "image" },
      { model: Company, field: "photoUrl" },
      { model: Banner, field: "photoUrl" },
      { model: Course, field: "thumbnail" },
    ];

    for (const { model, field } of modelsToUpdate) {
      const docs = await model.find({});
      console.log(`\nProcessing ${model.modelName} (${docs.length} records)...`);

      let updatedCount = 0;
      for (const doc of docs) {
        const rawPath = doc.get(field, null, { getters: false });
        if (rawPath && !rawPath.startsWith("http")) {
          // Remove leading slash if any
          const cleanPath = rawPath.startsWith("/") ? rawPath.slice(1) : rawPath;
          const absoluteUrl = `${LIVE_BASE_URL}/${cleanPath}`;
          
          doc[field] = absoluteUrl;
          
          await doc.save({ validateBeforeSave: false });
          updatedCount++;
        }
      }
      console.log(`✅ Updated ${updatedCount} records in ${model.modelName}`);
    }

    console.log("\n✨ Migration completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
};

migrate();
