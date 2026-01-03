const io = require("socket.io-client");
const readline = require("readline");

// Connect to Middleware
const socket = io("http://localhost:3007");

// The Agent joins the SAME room to talk to Ashan
const ROOM_ID = "room_ashan_123";
const MY_ID = "agent_007";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

socket.on("connect", () => {
    console.log(`✅ [AGENT] Online! Monitoring Room: ${ROOM_ID}`);
    socket.emit("join_room", ROOM_ID);
    console.log("-----------------------------------------");
    console.log("Waiting for customer queries...");
});

// LISTEN: Receive messages from Customer
socket.on("receive_message", (data) => {
    if (data.sender !== "AGENT") {
        console.log(`\n🔔 [Customer]: ${data.message}`);
        process.stdout.write("Reply > ");
    }
});

// SEND: Agent replies
rl.on("line", (input) => {
    socket.emit("send_message", {
        roomId: ROOM_ID,
        sender: "AGENT",
        senderId: MY_ID,
        message: input
    });
    process.stdout.write("Reply > ");
});