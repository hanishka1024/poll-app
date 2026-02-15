require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const Poll = require("./models/Poll");

const app = express();
const server = http.createServer(app);

// --- UPDATED FOR DEPLOYMENT ---
const VERCEL_URL = "https://poll-app-gold.vercel.app";

// 1. Middleware
app.use(
  cors({
    origin: VERCEL_URL, // Restricts access to only your Vercel frontend
    methods: ["GET", "POST"],
  }),
);
app.use(express.json());

// 2. MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// 3. Socket.io Setup - UPDATED CORS
const io = new Server(server, {
  cors: {
    origin: VERCEL_URL,
    methods: ["GET", "POST"],
  },
});

// 4. API Routes
app.post("/api/polls", async (req, res) => {
  try {
    const { question, options, settings } = req.body;
    const formattedOptions = options.map((opt) => ({ text: opt, votes: 0 }));

    const newPoll = new Poll({
      question,
      options: formattedOptions,
      settings: settings || { allowMulti: false },
      votedIPs: [], // Kept for schema compatibility, but not used for blocking
    });

    await newPoll.save();
    res.status(201).json(newPoll);
  } catch (error) {
    res.status(500).json({ error: "Failed to create poll" });
  }
});

app.get("/api/polls/:id", async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ error: "Poll not found" });
    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: "Invalid Poll ID" });
  }
});

// 5. Real-Time Logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinPoll", (pollId) => {
    socket.join(pollId);
  });

  socket.on("vote", async ({ pollId, indices }) => {
    try {
      const poll = await Poll.findById(pollId);

      if (!poll) return;

      // --- IP BLOCK REMOVED TO ALLOW SAME-WIFI VOTING ---

      if (Array.isArray(indices)) {
        indices.forEach((index) => {
          if (poll.options[index]) {
            poll.options[index].votes += 1;
          }
        });
      } else if (typeof indices === "number") {
        poll.options[indices].votes += 1;
      }

      await poll.save();

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

// 6. Start Server - UPDATED FOR RENDER
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
