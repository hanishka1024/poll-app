import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";

// Using your live Render URL
const API_BASE_URL = "https://poll-app-1-khiw.onrender.com";
const socket = io(API_BASE_URL);

export default function PollView() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [copyStatus, setCopyStatus] = useState("Share Poll Link");

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/polls/${id}`).then((res) => {
      setPoll(res.data);
      if (localStorage.getItem(`voted_${id}`)) setHasVoted(true);
    });

    socket.emit("joinPoll", id);
    socket.on("pollUpdated", (updated) => setPoll(updated));

    socket.on("error", (msg) => {
      alert(msg);
      setHasVoted(true);
      localStorage.setItem(`voted_${id}`, "true");
    });

    return () => {
      socket.off("pollUpdated");
      socket.off("error");
    };
  }, [id]);

  const toggleSelection = (index) => {
    if (hasVoted) return;
    // Single-select behavior is now forced here
    setSelectedIndices([index]);
  };

  const handleVoteSubmit = () => {
    if (selectedIndices.length === 0) return alert("Please select an option.");
    socket.emit("vote", { pollId: id, indices: selectedIndices });
    setHasVoted(true);
    localStorage.setItem(`voted_${id}`, "true");
  };

  const sharePoll = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyStatus("Link Copied! ✓");
    setTimeout(() => setCopyStatus("Share Poll Link"), 2000);
  };

  if (!poll)
    return <div style={styles.loader}>Syncing with live server...</div>;

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.liveDot}></div>
          <span style={styles.status}>Public Voting Live</span>
        </div>

        <h1 style={styles.question}>{poll.question}</h1>

        {hasVoted && (
          <div style={styles.successBanner}>✓ Your vote has been recorded!</div>
        )}

        <div style={styles.optionsList}>
          {poll.options.map((opt, i) => {
            const pct =
              totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
            const isSelected = selectedIndices.includes(i);

            return (
              <div
                key={i}
                onClick={() => toggleSelection(i)}
                style={{
                  border:
                    isSelected && !hasVoted
                      ? "2px solid #00ABE4"
                      : "1px solid #E9F1FA",
                  background: isSelected && !hasVoted ? "#F0F9FF" : "#FFFFFF",
                  cursor: hasVoted ? "default" : "pointer",
                  padding: "15px",
                  borderRadius: "12px",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    ...styles.optHeader,
                    color: isSelected && !hasVoted ? "#00ABE4" : "#334155",
                  }}
                >
                  <span>
                    {!hasVoted && (isSelected ? "✅ " : "⬜ ")}
                    {opt.text}
                  </span>
                  {hasVoted && <span>{pct}%</span>}
                </div>
                {hasVoted && (
                  <div style={styles.track}>
                    <div style={{ ...styles.fill, width: `${pct}%` }}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!hasVoted && (
          <button onClick={handleVoteSubmit} style={styles.submitBtn}>
            Submit Vote
          </button>
        )}

        <div style={styles.footer}>
          <button onClick={sharePoll} style={styles.shareBtn}>
            {copyStatus}
          </button>
          <p style={styles.voteSub}>{totalVotes} participants have voted</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    width: "100vw",
    background: "#E9F1FA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: '"Inter", sans-serif',
  },
  card: {
    background: "white",
    padding: "45px",
    borderRadius: "24px",
    boxShadow: "0 30px 60px rgba(0,0,0,0.1)",
    maxWidth: "500px",
    width: "90%",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "15px",
  },
  liveDot: {
    width: "8px",
    height: "8px",
    background: "#00ABE4",
    borderRadius: "50%",
    boxShadow: "0 0 8px #00ABE4",
  },
  status: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#00ABE4",
    textTransform: "uppercase",
  },
  question: {
    fontSize: "26px",
    color: "#003366",
    marginBottom: "35px",
    fontWeight: "800",
  },
  successBanner: {
    background: "#F0FDFA",
    color: "#14B8A6",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "bold",
    border: "1px solid #14B8A6",
    textAlign: "center",
  },
  optionsList: { display: "flex", flexDirection: "column" },
  optHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontWeight: "700",
  },
  track: {
    height: "8px",
    background: "#E9F1FA",
    borderRadius: "4px",
    marginTop: "10px",
  },
  fill: {
    height: "100%",
    background: "#00ABE4",
    borderRadius: "4px",
    transition: "width 0.6s ease",
  },
  submitBtn: {
    width: "100%",
    padding: "16px",
    background: "#00ABE4",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontWeight: "800",
    cursor: "pointer",
    marginTop: "10px",
  },
  footer: { marginTop: "30px", textAlign: "center" },
  shareBtn: {
    background: "#003366",
    color: "white",
    border: "none",
    padding: "12px 25px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
  },
  voteSub: {
    fontSize: "12px",
    color: "#94A3B8",
    marginTop: "15px",
    fontWeight: "600",
  },
  loader: {
    color: "#00ABE4",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: "20%",
  },
};
