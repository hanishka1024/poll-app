import React, { useState } from "react";
import axios from "axios";

// Using your live Render URL
const API_BASE_URL = "https://poll-app-1-khiw.onrender.com";

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [createdLinks, setCreatedLinks] = useState(null);
  const [copyStatus, setCopyStatus] = useState("Share Poll Link 🔗");

  const addOption = () => setOptions([...options, ""]);

  const handleCreate = async () => {
    const validOptions = options.filter((opt) => opt.trim() !== "");
    if (!question.trim() || validOptions.length < 2)
      return alert("Please provide a question and at least 2 options.");
    try {
      const res = await axios.post(`${API_BASE_URL}/api/polls`, {
        question,
        options: validOptions,
      });

      setCreatedLinks({
        vote: `${window.location.origin}/poll/${res.data._id}`,
        analytics: `${window.location.origin}/poll/${res.data._id}/analytics`,
      });
    } catch (err) {
      alert("System Error: Could not connect to the live server.");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(createdLinks.vote);
    setCopyStatus("Link Copied! ✓");
    setTimeout(() => setCopyStatus("Share Poll Link 🔗"), 2000);
  };

  if (createdLinks) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.card}>
          <div style={styles.successHeader}>
            <div style={styles.checkBadge}>✓</div>
            <h1 style={styles.title}>Poll Deployed!</h1>
            <p style={styles.subtitle}>
              Your real-time poll is live and ready for voters.
            </p>
          </div>
          <div style={styles.linkGroup}>
            <label style={styles.label}>Public Voting Link</label>
            <div style={styles.urlDisplay}>{createdLinks.vote}</div>
          </div>
          <div style={styles.buttonStack}>
            <button onClick={copyToClipboard} style={styles.btnPrimary}>
              {copyStatus}
            </button>
            <button
              onClick={() => window.open(createdLinks.analytics, "_blank")}
              style={styles.btnSecondary}
            >
              View Poll Analytics 📊
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                ...styles.btnSecondary,
                border: "none",
                color: "#64748B",
              }}
            >
              Create Another Poll +
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Poll</h1>
        <p style={styles.subtitle}>
          Configure your questions and options below.
        </p>
        <div style={{ textAlign: "left", marginBottom: "15px" }}>
          <label style={styles.label}>Poll Question</label>
          <input
            style={styles.mainInput}
            placeholder="e.g., Which feature should we build next?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
        <div style={{ textAlign: "left" }}>
          <label style={styles.label}>Options</label>
          {options.map((opt, i) => (
            <input
              key={i}
              style={styles.optionInput}
              placeholder={`Choice ${i + 1}`}
              value={opt}
              onChange={(e) => {
                let n = [...options];
                n[i] = e.target.value;
                setOptions(n);
              }}
            />
          ))}
        </div>
        <div style={styles.actions}>
          <button onClick={addOption} style={styles.btnSecondary}>
            + Add Option
          </button>
          <button onClick={handleCreate} style={styles.btnPrimary}>
            Deploy Poll
          </button>
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
    backgroundImage: "radial-gradient(circle at top right, #FFFFFF, #E9F1FA)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: '"Inter", sans-serif',
    margin: 0,
    padding: 0,
  },
  card: {
    background: "white",
    padding: "50px",
    borderRadius: "28px",
    boxShadow: "0 40px 80px rgba(0, 51, 102, 0.12)",
    maxWidth: "520px",
    width: "90%",
    textAlign: "center",
    border: "1px solid rgba(255, 255, 255, 0.8)",
  },
  successHeader: { marginBottom: "30px" },
  checkBadge: {
    width: "64px",
    height: "64px",
    background: "#00ABE4",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    margin: "0 auto 20px",
    boxShadow: "0 10px 20px rgba(0, 171, 228, 0.3)",
  },
  title: {
    fontSize: "32px",
    fontWeight: "900",
    color: "#003366",
    margin: "0 0 10px 0",
  },
  subtitle: { fontSize: "14px", color: "#64748B", marginBottom: "30px" },
  mainInput: {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    border: "2px solid #E9F1FA",
    marginBottom: "10px",
    fontSize: "16px",
    boxSizing: "border-box",
    outline: "none",
    backgroundColor: "#FFFFFF",
    color: "#000000",
    fontWeight: "500",
  },
  optionInput: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #E9F1FA",
    marginBottom: "12px",
    boxSizing: "border-box",
    outline: "none",
    backgroundColor: "#FFFFFF",
    color: "#000000",
    fontWeight: "500",
  },
  label: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#003366",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "block",
  },
  actions: { display: "flex", gap: "12px", marginTop: "20px" },
  buttonStack: { display: "flex", flexDirection: "column", gap: "12px" },
  btnPrimary: {
    flex: 1.5,
    padding: "16px",
    background: "linear-gradient(135deg, #00ABE4, #0077B6)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontWeight: "800",
    cursor: "pointer",
    fontSize: "15px",
    boxShadow: "0 8px 15px rgba(0, 171, 228, 0.3)",
  },
  btnSecondary: {
    flex: 1,
    padding: "16px",
    border: "2px solid #00ABE4",
    background: "white",
    color: "#00ABE4",
    borderRadius: "12px",
    fontWeight: "800",
    cursor: "pointer",
  },
  linkGroup: {
    background: "#F8FAFC",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "25px",
    border: "1px solid #E9F1FA",
    textAlign: "left",
  },
  urlDisplay: {
    fontSize: "12px",
    color: "#003366",
    wordBreak: "break-all",
    marginTop: "5px",
    fontFamily: "monospace",
    background: "#FFFFFF",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #E9F1FA",
  },
};
