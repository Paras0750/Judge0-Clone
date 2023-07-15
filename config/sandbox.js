const { createDockerContainer } = require("./docker");

const executeUserCodeInContainer = async (code, language) => {
  return new Promise(async (resolve, reject) => {
    const container = await createDockerContainer(language, code);
    await container.start();

    // send a TLE after 2sec
    const tle = setTimeout(async () => {
      console.log("sending a tle");
      resolve({
        result: "Time Limit Exceed!!",
        sucess: false,
      });
      await container.stop();
    }, 4000);

    const containerExitStatus = await container.wait(); // wait for container to exit

    // get logs
    const logs = await container.logs({ stdout: true, stderr: true });
    const cleanResult = logs
      .toString()
      .replace(/\u001b\[\d+m/g, "") // Remove escape sequences for color formatting  
      .trim(); // Remove leading and trailing whitespace

    // return output/error
    if (containerExitStatus.StatusCode === 0) {
      resolve({ result: cleanResult, sucess: true });
      clearTimeout(tle);
      await container.remove();
    } else {
      resolve({ error: cleanResult, sucess: false });
      clearTimeout(tle);
      await container.remove();
    }
  });
};

module.exports = { executeUserCodeInContainer };
