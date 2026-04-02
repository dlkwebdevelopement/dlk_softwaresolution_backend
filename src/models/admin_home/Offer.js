const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { getFullUrl } = require("../../utils/urlHelper");

const offerSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  title: { type: String, required: true, trim: true },
  photoUrl: { type: String, required: true, trim: true, get: getFullUrl },
}, { 
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

offerSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("Offer", offerSchema);
