// ===== REQUIRED PACKAGES =====
const express = require("express");
const Razorpay = require("razorpay");
const QRCode = require("qrcode");

const app = express();
app.use(express.json());

// ===== RAZORPAY API (ENV SE AATI HAI) =====
// Render → Environment me set hoti hai
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ===== FIXED VENDING PRICE =====
const FIXED_AMOUNT = 20; // ₹20 (sirf yahin change)

// ===== MACHINE STATUS STORE =====
let machineCommands = {
  JUICE_001: "IDLE"
};

// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
  res.send("Vending Server Running OK");
});

// ===== CREATE PAYMENT LINK + QR (CLOUD API) =====
// POST /create-qr
// Body: { "machineId": "JUICE_001" }
app.post("/create-qr", async (req, res) => {
  try {
    const { machineId } = req.body;
    if (!machineId) {
      return res.status(400).send("machineId required");
    }

    // 1️⃣ Fixed-amount payment link
    const link = await razorpay.paymentLink.create({
      amount: FIXED_AMOUNT * 100, // paise
      currency: "INR",
      description: `Fresh Orange Juice | ${machineId}`,
      notify: { sms: false, email: false },
      reminder_enable: false
    });

    // 2️⃣ QR generate (base64)
    const qr = await QRCode.toDataURL(link.short_url);

    res.json({
      machineId,
      amount: FIXED_AMOUNT,
      paymentLink: link.short_url,
      qrBase64: qr
    });

  } catch (err) {
    console.error("QR create error:", err);
    res.status(500).send("QR creation failed");
  }
});

// ===== RAZORPAY WEBHOOK =====
// URL: https://YOUR-RENDER-URL/payment
// Event: payment.captured
app.post("/payment", (req, res) => {
  const description =
    req.body?.payload?.payment?.entity?.description || "";

  console.log("Payment:", description);

  for (let id in machineCommands) {
    if (description.includes(id)) {
      machineCommands[id] = "START";
      console.log("START machine:", id);
    }
  }

  res.send("OK");
});

// ===== ESP32 POLLING =====
// ESP32 calls: /command?machine_id=JUICE_001
app.get("/command", (req, res) => {
  const id = req.query.machine_id;
  const cmd = machineCommands[id] || "IDLE";
  machineCommands[id] = "IDLE";
  res.send(cmd);
});

// ===== SERVER START =====
app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Vending server started");
});

