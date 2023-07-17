const CodeRunner = require("../config/sandbox");
const {
  connectRabbitMQ,
  publishMessageToCodeExecutionQueue,
} = require("../config/rabbitmq");
const Submission = require("../models/Submission");
const User = require("../models/User");

const codeExecute = (req, res) => {
  const { code, language } = req.body;
  const codeRunner = new CodeRunner(code, language);

  codeRunner
    .runCode()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};

const codeSubmissions = async (req, res) => {
  const { userSubmittedCode, codeLanguage } = req.body;
  const { _id } = req.user;

  let submissionId;

  try {
    const user = await User.findOne({ _id }).exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newSubmission = new Submission({
      code: userSubmittedCode,
      language: codeLanguage,
      userId: _id,
    });

    await newSubmission.save().then((submission) => {
      submissionId = submission._id;
      console.log("Submission saved successfully");
    });

    const { connection, channel } = await connectRabbitMQ();
    await publishMessageToCodeExecutionQueue(
      connection,
      channel,
      userSubmittedCode,
      codeLanguage,
      submissionId,
      res
    );
  } catch (err) {
    console.log("Error saving submission or publishing message:", err);
    return res.status(500).json({ message: "Failed to save code" });
  }
};

module.exports = { codeExecute, codeSubmissions };
