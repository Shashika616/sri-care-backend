// test-chat.js
const { io } = require("socket.io-client");

const socket = io("http://localhost:5000/api/chat", {
  transports: ["websocket"],
  extraHeaders: {
    "x-gateway-secret": process.env.GATEWAY_SECRET,
    "x-user-id": "test-user",
    "x-user-role": "customer",
  }
});

socket.on("connect", () => {
  console.log("✅ Connected", socket.id);
  socket.emit("customer:join", {
    customerId: "test-user",
    customerName: "Test User"
  });
});

socket.on("customer:queued", (data) => {
  console.log("📋 Queued:", data);
});

socket.on("customer:agent-assigned", (data) => {
  console.log("👤 Assigned to agent:", data);
});

socket.on("message:received", (msg) => {
  console.log("💬 New message:", msg);
});

socket.on("disconnect", () => console.log("⚡ Disconnected"));
