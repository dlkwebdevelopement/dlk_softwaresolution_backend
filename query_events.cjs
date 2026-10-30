const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const events = await db.collection('galleryevents').find({}).toArray();
    console.log('Total events:', events.length);
    for (const ev of events) {
      console.log('EVENT:', ev.title, '| College:', ev.collegeName, '| mainImage:', ev.mainImage, '| galleryImages count:', ev.galleryImages?.length);
      if (ev.galleryImages && ev.galleryImages.length > 0) {
        console.log('  galleryImages[0]:', typeof ev.galleryImages[0] === 'object' ? JSON.stringify(ev.galleryImages[0]) : ev.galleryImages[0]);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
})();

