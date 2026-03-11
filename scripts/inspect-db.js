const mongoose = require("mongoose");
require("dotenv").config();

// Models
const Navbar = require("../src/models/admin_home/Navbar");

const inspect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const docs = await Navbar.find({}).limit(5);
    console.log("Raw Data Samples from Navbar:");
    docs.forEach(doc => {
      // Use .get(field, null, { getters: false }) to see raw value
      console.log(`- ID: ${doc._id}, Category: ${doc.category}, Raw Image: ${doc.get('image', null, { getters: false })}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

inspect();
