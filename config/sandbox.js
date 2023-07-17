const { createDockerContainer } = require("./docker");
const ExecutionResult = require("../models/ExecutionResult");

function parseLogs(logs, language) {
  if (language == "js") {
    return logs
      .replace(/\r?\n/g, "")
      .replace(/\[90m/g, "... ")
      .replace(/\[39m/g, "")
      .replace(/\[33m/g, "");
  } else if (language == "c" || language == "cpp") {
    return logs
      .replace(/\x1B\[[0-9;]*[m]/g, "")
      .replace(/\[K/g, "")
      .replace(/\r?\n/g, "");
  } else {
    return logs;
  }
}

const executeUserCodeInContainer = async (code, language, submissionId) => {
  return new Promise(async (resolve, reject) => {
    const container = await createDockerContainer(language, code);
    await container.start();

    // send a TLE after 2sec
    const tle = setTimeout(async () => {
      console.log("sending a tle");
      resolve({
        result: "Time Limit Exceed!!",
        success: false,
      });
      await container.stop();
    }, 4000);

    const containerExitStatus = await container.wait(); // wait for container to exit

    // get logs
    const logs = await container.logs({ stdout: true, stderr: true });

    const cleanResult = parseLogs(logs.toString(), language);

    let success = containerExitStatus.StatusCode === 0 ? true : false;

    const executionResult = new ExecutionResult({
      submissionId: submissionId,
      output: cleanResult,
      status: success ? "success" : "failure",
    });

    await executionResult
      .save()
      .then((result) => {
        console.log("Execution result saved successfully");
      })
      .catch((err) => console.log("Execution result couldn't save", err));

    // return output/error
    if (success) {
      resolve({ result: cleanResult, success: true });
      clearTimeout(tle);
      await container.remove();
    } else {
      resolve({ error: cleanResult, success: false });
      clearTimeout(tle);
      await container.remove();
    }
  });
};

module.exports = { executeUserCodeInContainer };
