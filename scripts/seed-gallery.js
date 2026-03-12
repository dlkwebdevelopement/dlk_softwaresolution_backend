const mongoose = require("mongoose");
require("dotenv").config();
const Gallery = require("../src/models/admin_home/Gallery");
const { getFullUrl } = require("../src/utils/urlHelper");

const seedGallery = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    // Clear existing gallery data to avoid duplicates if re-running
    await Gallery.deleteMany({});
    console.log("🧹 Existing gallery data cleared");

    const now = new Date();
    const timestamp = `${now.getFullYear()}_${(now.getMonth() + 1).toString().padStart(2, '0')}_${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}_${now.getMinutes().toString().padStart(2, '0')}_${now.getSeconds().toString().padStart(2, '0')}`;

    const getPath = (album, baseName) => getFullUrl(`uploads/${album}/${baseName}_${timestamp}.png`);

    const albums = [
      {
        albumName: "Workshop",
        images: [
          getPath("Workshop", "workshop_1"),
          getPath("Workshop", "workshop_2")
        ]
      },
      {
        albumName: "Training",
        images: [
          getPath("Training", "training_1"),
          getPath("Training", "training_2")
        ]
      },
      {
        albumName: "Project",
        images: [
          getPath("Project", "project_1"),
          getPath("Project", "project_2")
        ]
      },
      {
        albumName: "Internship",
        images: [
          getPath("Internship", "internship_1"),
          getPath("Internship", "internship_2")
        ]
      },
      {
        albumName: "Project discussion",
        images: [
          getPath("Project discussion", "discussion_1"),
          getPath("Project discussion", "discussion_2")
        ]
      },
      {
        albumName: "Certification",
        images: [
          getPath("Certification", "certification_1"),
          getPath("Certification", "certification_2")
        ]
      }
    ];

    await Gallery.insertMany(albums);
    console.log("🌱 Gallery seeded successfully with 6 albums!");

    mongoose.connection.close();
    console.log("🔌 MongoDB Connection closed");
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
};

seedGallery();
