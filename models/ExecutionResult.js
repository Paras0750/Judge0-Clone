const mongoose = require("mongoose");

const executionResultSchema = new mongoose.Schema({
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Submission",
    required: true,
  },
  output: {
    type: String,
    required: true,
  },
  error: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["success", "failure"],
    default: "success",
  },
});

module.exports = mongoose.model("ExecutionResult", executionResultSchema);
