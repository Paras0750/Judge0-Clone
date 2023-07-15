const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },
});

module.exports = mongoose.model("Submission", submissionSchema);
