const express = require("express");
const app = express();

app.use(express.json());

// 🔹 QR-ID → MACHINE NAME MAP
const qrToMachineMap = {
  "qr_SESBTTiE4fR82a": "JUICE_001",
  //"qr_SE3cIiyla9BguG": "JUICE_002"
};

// Machine command store
let machineCommands = {
  JUICE_001: "IDLE",
  //JUICE_002: "IDLE"
};

// Root check
app.get("/", (req, res) => {
  res.send("Vending Server Running OK");
});

// Razorpay webhook
app.post("/payment", (req, res) => {
  const qrId = req.body?.payload?.payment?.entity?.qr_code_id;

  console.log("💰 Payment from QR ID:", qrId);

  const machineName = qrToMachineMap[qrId];

  if (machineName && machineCommands[machineName] !== undefined) {
    machineCommands[machineName] = "START";
    console.log("✅ START machine:", machineName);
  } else {
    console.log("❌ Unknown QR ID");
  }

  res.send("OK");
});

// ESP32 polling
app.get("/command", (req, res) => {
  const machineId = req.query.machine_id;

  const cmd = machineCommands[machineId] || "IDLE";
  machineCommands[machineId] = "IDLE";

  res.send(cmd);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Static QR vending server running");
});





