const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { getFullUrl } = require("../../utils/urlHelper");

const skillSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  icon: { 
    type: String, 
    trim: true, 
    get: getFullUrl 
  },
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Virtual for ID
skillSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("Skill", skillSchema);
