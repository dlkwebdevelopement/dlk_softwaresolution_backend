const mongoose = require("mongoose");
require("dotenv").config();

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    // Migrate Galleries
    const galleries = await db.collection("galleries").find({}).toArray();
    for (const g of galleries) {
      if (Array.isArray(g.images) && g.images.length > 0 && typeof g.images[0] === 'string') {
        const newImages = g.images.map(url => ({ url, highlights: [] }));
        await db.collection("galleries").updateOne({ _id: g._id }, { $set: { images: newImages } });
        console.log(`Migrated Gallery: ${g.albumName}`);
      }
    }

    // Migrate GalleryEvents
    const events = await db.collection("galleryevents").find({}).toArray();
    for (const e of events) {
      if (Array.isArray(e.galleryImages) && e.galleryImages.length > 0 && typeof e.galleryImages[0] === 'string') {
        const newImages = e.galleryImages.map(url => ({ url, highlights: [] }));
        await db.collection("galleryevents").updateOne({ _id: e._id }, { $set: { galleryImages: newImages } });
        console.log(`Migrated Event: ${e.title}`);
      }
    }

    console.log("Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
