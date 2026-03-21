const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const videoSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  link: { 
    type: String, 
    required: true, 
    trim: true 
  },
  category: { 
    type: String, 
    required: true, 
    trim: true,
    enum: ['Tutorials', 'Roadmaps', 'Workshops', 'Placements', 'Design']
  },
  duration: { 
    type: String, 
    trim: true 
  },
  thumbnail: { 
    type: String, 
    trim: true 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

videoSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("Video", videoSchema);
