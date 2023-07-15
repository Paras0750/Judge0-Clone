const express = require("express");
const { codeExecute, codeSubmissions } = require("../controllers/codeController");

const codeRoutes = express.Router();

codeRoutes.post("/execute", codeExecute);
codeRoutes.post("/submissions", codeSubmissions);

module.exports = codeRoutes;
