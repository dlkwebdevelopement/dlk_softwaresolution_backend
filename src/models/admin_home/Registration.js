const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const registrationSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  courseId: { type: String, ref: "Navbar", required: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    trim: true, 
    lowercase: true, 
    index: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  mobile: { type: String, trim: true },
  location: { type: String, trim: true },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

registrationSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("Registration", registrationSchema);
