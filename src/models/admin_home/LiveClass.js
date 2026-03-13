const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const liveClassSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  courseId: { type: String, ref: "CourseCategory", required: true, index: true },
  title: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  durationDays: { type: Number, required: true },
  startTime: { type: String, required: true, trim: true },
  endTime: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
}, { 
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

liveClassSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("LiveClass", liveClassSchema);
