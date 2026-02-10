const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Machine command store
let machineCommands = {
  JUICE_001: "IDLE",
  //JUICE_002: "IDLE",
};

// Webhook
app.post("/payment", (req, res) => {
  const qrName =
    req.body?.payload?.payment?.entity?.notes?.qr_name ||
    req.body?.payload?.payment?.entity?.qr_code_id;

  console.log("💰 Payment from QR:", qrName);

  if (machineCommands[qrName] !== undefined) {
    machineCommands[qrName] = "START";
    console.log("✅ START machine:", qrName);
  }

  res.send("OK");
});

// ESP32 polling
app.get("/command", (req, res) => {
  const machineId = req.query.machine_id;

  if (!machineCommands[machineId]) {
    return res.send("IDLE");
  }

  const cmd = machineCommands[machineId];
  machineCommands[machineId] = "IDLE";
  res.send(cmd);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Static QR vending server running");
});


