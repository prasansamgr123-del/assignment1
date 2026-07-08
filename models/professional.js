const mongoose = require("mongoose");

// A schema describes the shape of a document: which fields exist and their rules.
// These rules ("validators") are guardrails — Mongoose rejects any save that breaks them.
const professionalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: [true, message] — the field must be present; the message
      // is what shows up in the validation error if it's missing.
      required: [true, "Name is required"],
      // trim: removes leading/trailing spaces, so "  Ram " is stored as "Ram".
      trim: true,
      // minlength: [n, message] — reject names shorter than n characters.
      minlength: [3, "Name must be at least 3 chars"],
    },
    category: {
      type: String,
      required: true,
      // enum: value must be one of these exact strings — anything else is rejected.
      enum: ["Developer", "Designer", "Manager"],
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  },
);

// A model is the tool we use to read/write documents of this shape.
// Mongoose creates a "professionals" collection in MongoDB from the name "Professional".
const Professional = mongoose.model("Professional", professionalSchema);

module.exports = Professional;
