require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const Poll = require("./models/Poll");

const app = express();
const server = http.createServer(app);

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// 3. Socket.io Setup
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// 4. API Routes

// Create a new poll with Settings (Requirement #1 & #4)
app.post("/api/polls", async (req, res) => {
  try {
    const { question, options, settings } = req.body;

    const formattedOptions = options.map((opt) => ({ text: opt, votes: 0 }));

    const newPoll = new Poll({
      question,
      options: formattedOptions,
      settings: settings || { allowMulti: false }, // Store multi-select preference
      votedIPs: [],
    });

    await newPoll.save();
    res.status(201).json(newPoll);
  } catch (error) {
    res.status(500).json({ error: "Failed to create poll" });
  }
});

// Get a specific poll (Requirement #5)
app.get("/api/polls/:id", async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ error: "Poll not found" });
    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: "Invalid Poll ID" });
  }
});

// 5. Real-Time Logic (Requirement #3)
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinPoll", (pollId) => {
    socket.join(pollId);
  });

  // Updated Vote Handler for Multi-Select (Requirement #2 & #4)
  socket.on("vote", async ({ pollId, indices }) => {
    try {
      // MECHANISM 1: IP Tracking
      const ip = socket.handshake.address || socket.conn.remoteAddress;
      const poll = await Poll.findById(pollId);

      if (!poll) return;

      // Fairness Check: Prevent repeat voting from same IP
      if (poll.votedIPs.includes(ip)) {
        return socket.emit(
          "error",
          "You have already voted from this network.",
        );
      }

      // Process multiple votes if indices is an array
      if (Array.isArray(indices)) {
        indices.forEach((index) => {
          if (poll.options[index]) {
            poll.options[index].votes += 1;
          }
        });
      } else if (typeof indices === "number") {
        // Fallback for single vote
        poll.options[indices].votes += 1;
      }

      // Save IP to prevent re-voting
      poll.votedIPs.push(ip);
      await poll.save();

      // Real-time broadcast to all users in the poll room
      io.to(pollId).emit("pollUpdated", poll);
    } catch (err) {
      console.error("Vote error:", err);
      socket.emit("error", "An error occurred while processing your vote.");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// 6. Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
