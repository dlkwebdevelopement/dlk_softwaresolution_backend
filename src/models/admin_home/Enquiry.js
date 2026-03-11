const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const enquirySchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    trim: true, 
    lowercase: true, 
    index: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  mobile: { type: String, required: true, trim: true },
  course: { type: String, required: true, trim: true, index: true },
  location: { type: String, required: true, trim: true },
  timeslot: { type: String, required: true, trim: true },
}, { 
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

enquirySchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("Enquiry", enquirySchema);
