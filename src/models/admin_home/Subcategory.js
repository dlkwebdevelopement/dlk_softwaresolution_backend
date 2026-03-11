const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const subcategorySchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  subcategory: { type: String, required: true, trim: true },
  category_id: { type: String, ref: "Navbar", required: true, index: true },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

subcategorySchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("Subcategory", subcategorySchema);
