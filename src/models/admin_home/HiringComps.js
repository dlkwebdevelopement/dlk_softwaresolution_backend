const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const hiringCompsSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  companies: [{ type: String, trim: true }],
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

hiringCompsSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("HiringComps", hiringCompsSchema);
