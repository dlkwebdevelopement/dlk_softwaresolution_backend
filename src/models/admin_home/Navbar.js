const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const { getFullUrl } = require("../../utils/urlHelper");

const navbarSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  category: { type: String, required: true, trim: true, index: true },
  image: { type: String, trim: true, get: getFullUrl },
  description: { type: String, trim: true },
}, { 
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

navbarSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("Navbar", navbarSchema);
