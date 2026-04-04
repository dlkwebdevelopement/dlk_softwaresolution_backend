const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { getFullUrl } = require("../../utils/urlHelper");

const workshopSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  title: { type: String, required: true, trim: true },
  image: { type: String, trim: true, get: getFullUrl },
  duration: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true, trim: true },
  endTime: { type: String, required: true, trim: true },
  categoryName: { type: String, required: true, trim: true },
  expertName: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
}, { 
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

workshopSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("Workshop", workshopSchema);
