const mongoose = require("mongoose");
require("dotenv").config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const albums = await db.collection("galleries").find({}).toArray();
    
    albums.forEach(a => {
      console.log(`Album: ${a.albumName}, Images:`, JSON.stringify(a.images));
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
