const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const contactSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  first_name: { type: String, required: true, trim: true },
  last_name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    trim: true, 
    lowercase: true, 
    index: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  phone: { type: String, trim: true },
  message: { type: String, required: true, trim: true },
  accept_terms: { type: Boolean, default: true },
}, { 
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

contactSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("Contact", contactSchema);
