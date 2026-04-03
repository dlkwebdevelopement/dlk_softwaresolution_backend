const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { getFullUrl } = require("../../utils/urlHelper");

const placementSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  photoUrl: { type: String, required: true, trim: true, get: getFullUrl },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
}, { 
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

placementSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("Placement", placementSchema);
