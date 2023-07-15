const CodeRunner = require("../config/sandbox");
const {
  connectRabbitMQ,
  publishMessageToCodeExecutionQueue,
} = require("../config/rabbitmq");

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

  try {
    const { connection, channel } = await connectRabbitMQ();
    await publishMessageToCodeExecutionQueue(
      connection,
      channel,
      userSubmittedCode,
      codeLanguage,
      res
    );
  } catch (er) {
    console.log("Error Publishing message to RcpCodeExecution queue", er);
    res.status(500).json({ err: "Somethig Went Wrong" });
  }
};

module.exports = { codeExecute, codeSubmissions };
