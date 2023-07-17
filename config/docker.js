const docker = new require("dockerode")();

// helper fun to get image according to user Selected language
function getDockerImage(language) {
  let image;

  switch (language) {
    case "cpp":
      image = "gcc";
      break;
    case "js":
      image = "node";
      break;
    case "c":
      image = "gcc";
      break;
    default:
      // image = "node";
    throw new Error(`unsupprted language: ${language}`);
  }

  return image;
}

// Create container according to user selected language
async function createDockerContainer(language, code) {

  code = code.toString();
  code = parseCode(code,language);

  const containerConfig = {
    Image: getDockerImage(language), //node
    Cmd: getExecutionCommand(language, code), // ["node", "-e", code]
    Tty: true,
    // HostConfig: {
    //   StopTimeout: 2, // Stop the container after 2 seconds
    // },
  };
  // same as docker create --image imageName --tty --command cmdToRun
  const container = await docker.createContainer(containerConfig);

  return container;
}

function parseCode(code,language){
  if(language == "c" || language == "cpp"){
      return code.replace(/"/g, '\\"');
  }else{
      return code;
  }
}

function getExecutionCommand(language, code) {
  let cmd;

  switch (language) {
    case "cpp":
      cmd = [
        "bash",
        "-c",
        `echo "${code}" > myapp.cpp && g++ -o myapp myapp.cpp && ./myapp`,
      ];
      console.log(cmd);
      break;
    case "js":
      cmd = ["node", "-e", code];
      break;
    case "c":
      cmd = [
        "bash",
        "-c",
        `echo "${code}" > myapp.c && gcc -o myapp myapp.c && ./myapp`,
      ];
      break;
    default:
    throw new Error(`unsupprted language: ${language}`);
  }

  return cmd;
}

module.exports = { createDockerContainer };
