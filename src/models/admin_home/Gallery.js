const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const { getFullUrl } = require("../../utils/urlHelper");

const gallerySchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  albumName: { 
    type: String, 
    required: true, 
    trim: true,
    enum: [
      'Workshop', 
      'Training', 
      'Project', 
      'Internship', 
      'Project discussion', 
      'Certification'
    ]
  },
  images: [{ type: String, trim: true, get: getFullUrl }],
}, { 
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

gallerySchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("Gallery", gallerySchema);
