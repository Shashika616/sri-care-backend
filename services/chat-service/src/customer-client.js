const io = require("socket.io-client");
const readline = require("readline");

// Connect to Middleware
const socket = io("http://localhost:3007");

const ROOM_ID = "room_ashan_123";
const MY_ID = "customer_ashan";

// Setup Input Interface (to type in terminal)
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

socket.on("connect", () => {
    console.log(`✅ [CUSTOMER] Connected! Joining Room: ${ROOM_ID}`);
    socket.emit("join_room", ROOM_ID);
    console.log("-----------------------------------------");
    console.log("Type a message and press ENTER to send:");
});

// LISTEN: Receive messages from Agent
socket.on("receive_message", (data) => {
    if (data.sender !== "CUSTOMER") {
        console.log(`\n💬 [SriCare Agent]: ${data.message}`);
        process.stdout.write("> "); // prompt for next line
    }
});

// SEND: Read from terminal and send
rl.on("line", (input) => {
    socket.emit("send_message", {
        roomId: ROOM_ID,
        sender: "CUSTOMER",
        senderId: MY_ID,
        message: input
    });
    process.stdout.write("> ");
});