const express = require("express");
const app = express();

app.use(express.json());

// Machine command store
let machineCommands = {
  JUICE_001: "IDLE",
  //JUICE_002: "IDLE",
};

// Health check
app.get("/", (req, res) => {
  res.send("Vending Server Running OK");
});

// Razorpay webhook (DESCRIPTION BASED)
app.post("/payment", (req, res) => {
  const description =
    req.body?.payload?.payment?.entity?.description || "";

  console.log("💰 Payment description:", description);

  // Detect machine from description
  for (let machineId in machineCommands) {
    if (description.includes(machineId)) {
      machineCommands[machineId] = "START";
      console.log("✅ START machine:", machineId);
    }
  }

  res.status(200).send("OK");
});

// ESP32 polling
app.get("/command", (req, res) => {
  const machineId = req.query.machine_id;

  const cmd = machineCommands[machineId] || "IDLE";
  machineCommands[machineId] = "IDLE"; // reset after read

  res.send(cmd);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Vending server running");
});





