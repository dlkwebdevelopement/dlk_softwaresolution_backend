const mongoose = require("mongoose");

const projectCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  isUsed: { type: Boolean, default: false },
}, { 
  timestamps: true 
});

// Auto-delete after 24 hours
projectCodeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model("ProjectCode", projectCodeSchema);
