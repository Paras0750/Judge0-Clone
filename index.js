require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const verifyToken = require("./middlewares/authorization");
const cluster = require("cluster");
const os = require("os");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const { startRcpServerAsWorker } = require("./config/rabbitmq");
// Import routes
const authRoutes = require("./routes/auth");
const codeRoutes = require("./routes/code");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Routes
app.use("/auth", authRoutes);
app.use("/code", verifyToken, codeRoutes);

app.get("/", (req, res) => {
  for (let index = 0; index < 5000000; index++) {

  }
  res.send("Hello World!");
});

// Start the server
let cpuThreads = os.cpus().length;
if (cpuThreads >= 4) cpuNum = 4; // limit worker to 4

if (cluster.isMaster) {
  for (let i = 0; i < cpuNum; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} exited`);
    cluster.fork();
  });
} else {

  startRcpServerAsWorker(); 
  

  const server = app.listen(PORT, () => {
    console.log(
      `server ${process.pid} is listening on port ${PORT}, http://localhost:3000/`
    );
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.log(`Port ${port} is already in use`);
    } else {
      console.error("An error occurred:", error);
    }
  });
}

// app.listen(PORT, () => {
//   console.log(
//     `server ${process.pid} is listening on port ${PORT}, http://localhost:3000/`
//   );
// });