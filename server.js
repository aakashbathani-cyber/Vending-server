const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

let command = "IDLE";

// Razorpay webhook
app.post("/payment", (req, res) => {
  console.log("💰 Payment received");

  if (req.body.event === "payment.captured") {
    command = "START";
    console.log("✅ START machine");
  }

  res.send("OK");
});

// ESP32 polling
app.get("/command", (req, res) => {
  res.send(command);
  command = "IDLE";
});

app.get("/", (req, res) => {
  res.send("Vending server running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
