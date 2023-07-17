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
  for (let index = 0; index < 5000000; index++) {}
  res.send("Hello World!");
});
app.get("/save", verifyToken, (req, res) => {
  const { _id } = req.user;

  User.findOne({ _id: _id }, (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's document with the code
    user.code = code;

    // Save the updated user document
    user.save((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to save code" });
      }

      return res.status(200).json({ message: "Code saved successfully" });
    });
  });
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
      `server ${process.pid} is listening on http://localhost:${PORT}/`
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
