const mongoose = require("mongoose");

const blogCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  isUsed: { type: Boolean, default: false },
}, { 
  timestamps: true 
});

// Auto-delete after 24 hours (24 * 60 * 60 = 86400 seconds)
blogCodeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model("BlogCode", blogCodeSchema);
