const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/connectDB");
const router = require("./routes/index");
const cookieParser = require("cookie-parser");
const { app, server } = require("./socket/index");

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET,HEAD,PUT,PATCH,POST,DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 8090;

// API endpoints
app.use("/api", router);

// Error handling for 404
app.use((req, res) => {
  res.status(404).send({
    error: "Not Found",
  });
});

// Connect to the database and start the server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running at ${PORT}`);
  });
});
